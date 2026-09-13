from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import ipaddress
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from html import escape
from html.parser import HTMLParser
from typing import List, Optional
from urllib.parse import urlparse

import bcrypt
import httpx
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"

IS_LOCAL = os.environ.get("FRONTEND_URL", "").startswith(("http://localhost", "http://127.0.0.1"))
COOKIE_SECURE = not IS_LOCAL
COOKIE_SAMESITE = "lax" if IS_LOCAL else "none"

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ["OWNER_EMAIL"]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Auth ----------------

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    response.set_cookie(key="access_token", value=create_access_token(user_id, email), httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=create_refresh_token(user_id), httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user


async def get_current_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")
    return user


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


@api_router.post("/auth/login")
async def login(input: LoginIn, request: Request, response: Response):
    email = input.email.lower().strip()
    identifier = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("attempts", 0) >= 5:
        last = attempt.get("last_attempt")
        if last and datetime.now(timezone.utc) - datetime.fromisoformat(last) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Muitas tentativas. Tente novamente em 15 minutos.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"attempts": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    await db.login_attempts.delete_one({"identifier": identifier})
    set_auth_cookies(response, user["id"], user["email"])
    return {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"status": "success"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    response.set_cookie(key="access_token", value=create_access_token(user["id"], user["email"]), httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, max_age=3600, path="/")
    return {"status": "success"}


# ---------------- Email (Emergent managed Resend) ----------------

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: Optional[str] = None) -> Optional[str]:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client_http:
            resp = await client_http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        return None


def _email_table(rows: List[tuple], title: str) -> str:
    cells = "".join(
        f'<tr><td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:12px;color:#8B968A;text-transform:uppercase;letter-spacing:1px;vertical-align:top;white-space:nowrap">{escape(k)}</td>'
        f'<td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:14px;color:#EAEFE8">{v}</td></tr>'
        for k, v in rows
    )
    return (
        '<table role="presentation" width="100%" style="background:#0A0D0B;padding:32px 0"><tr><td align="center">'
        '<table role="presentation" width="560" style="background:#111612;border:1px solid #232b24">'
        f'<tr><td style="padding:24px;font-family:Arial,sans-serif"><p style="margin:0;font-size:11px;letter-spacing:3px;color:#996236;text-transform:uppercase">LG Industrial</p>'
        f'<h1 style="margin:8px 0 16px;font-size:22px;color:#EAEFE8">{escape(title)}</h1></td></tr>'
        f"{cells}"
        '<tr><td style="padding:20px 16px;font-family:Arial,sans-serif;font-size:11px;color:#8B968A">Enviado pelo site da LG Industrial. Nunca pedimos senhas ou dados de cartão por e-mail.</td></tr>'
        "</table></td></tr></table>"
    )


# ---------------- Public: contact & quotes ----------------

class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default="", max_length=30)
    message: str = Field(min_length=5, max_length=3000)


@api_router.post("/contact")
async def create_contact(input: ContactIn):
    doc = {
        "id": str(uuid.uuid4()),
        "type": "contact",
        "name": input.name.strip(),
        "email": input.email.lower().strip(),
        "phone": input.phone.strip(),
        "message": input.message.strip(),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(doc)
    html = _email_table([
        ("Nome", escape(doc["name"])),
        ("E-mail", escape(doc["email"])),
        ("Telefone", escape(doc["phone"] or "-")),
        ("Mensagem", escape(doc["message"])),
    ], "Novo contato pelo site")
    email_id = await send_email(to=OWNER_EMAIL, subject=f"Novo contato pelo site - {doc['name']}", html=html)
    return {"status": "success", "email_sent": email_id is not None}


class QuoteIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=30)
    product_id: Optional[str] = Field(default=None)
    product_name: str = Field(min_length=2, max_length=160)
    message: Optional[str] = Field(default="", max_length=2000)


@api_router.post("/quotes")
async def create_quote(input: QuoteIn):
    doc = {
        "id": str(uuid.uuid4()),
        "type": "quote",
        "name": input.name.strip(),
        "phone": input.phone.strip(),
        "product_id": input.product_id,
        "product_name": input.product_name.strip(),
        "message": (input.message or "").strip(),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.quotes.insert_one(doc)
    html = _email_table([
        ("Produto", escape(doc["product_name"])),
        ("Nome", escape(doc["name"])),
        ("Telefone", escape(doc["phone"])),
        ("Mensagem", escape(doc["message"] or "-")),
    ], "Novo pedido de orçamento")
    email_id = await send_email(to=OWNER_EMAIL, subject=f"Pedido de orçamento - {doc['product_name']}", html=html)
    return {"status": "success", "email_sent": email_id is not None}


# ---------------- Products ----------------

class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=5, max_length=1000)
    image_url: str = Field(min_length=5, max_length=600)
    featured: bool = False


@api_router.get("/products")
async def list_products():
    return await db.products.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)


@api_router.post("/admin/products")
async def create_product(input: ProductIn, admin: dict = Depends(get_current_admin)):
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, input: ProductIn, admin: dict = Depends(get_current_admin)):
    result = await db.products.update_one({"id": product_id}, {"$set": input.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"status": "success"}


# ---------------- Admin: messages & quotes ----------------

@api_router.get("/admin/messages")
async def list_messages(admin: dict = Depends(get_current_admin)):
    return await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.patch("/admin/messages/{message_id}/read")
async def mark_message_read(message_id: str, admin: dict = Depends(get_current_admin)):
    await db.messages.update_one({"id": message_id}, {"$set": {"read": True}})
    return {"status": "success"}


@api_router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, admin: dict = Depends(get_current_admin)):
    await db.messages.delete_one({"id": message_id})
    return {"status": "success"}


@api_router.get("/admin/quotes")
async def list_quotes(admin: dict = Depends(get_current_admin)):
    return await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.patch("/admin/quotes/{quote_id}/read")
async def mark_quote_read(quote_id: str, admin: dict = Depends(get_current_admin)):
    await db.quotes.update_one({"id": quote_id}, {"$set": {"read": True}})
    return {"status": "success"}


@api_router.delete("/admin/quotes/{quote_id}")
async def delete_quote(quote_id: str, admin: dict = Depends(get_current_admin)):
    await db.quotes.delete_one({"id": quote_id})
    return {"status": "success"}


@api_router.get("/")
async def root():
    return {"message": "LG Industrial API"}


# ---------------- Startup ----------------

SEED_PRODUCTS = [
    {"name": "Colheitadeira Axial X9", "category": "Colheita", "featured": True,
     "description": "Colheitadeira de última geração com automação embarcada, monitoramento de rendimento em tempo real e manutenção preditiva.",
     "image_url": "https://images.pexels.com/photos/38952133/pexels-photo-38952133.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Trator Série T8 SmartTrax", "category": "Tração", "featured": True,
     "description": "Trator de alta potência com telemetria integrada, piloto automático e transmissão continuamente variável para máxima eficiência no campo.",
     "image_url": "https://images.unsplash.com/photo-1594691592645-3f8351f04e84?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxhZ3JpY3VsdHVyYWwlMjBtYWNoaW5lcnklMjBjbG9zZSUyMHVwfGVufDB8fHx8MTc4NzQ0OTg4Mnww&ixlib=rb-4.1.0&q=85"},
    {"name": "Plantadeira Precision P20", "category": "Plantio", "featured": True,
     "description": "Plantio de precisão com controle individual de linhas, taxa variável de sementes e conectividade total com a fazenda.",
     "image_url": "https://images.pexels.com/photos/21854070/pexels-photo-21854070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Pulverizador Autopropelido S300", "category": "Pulverização", "featured": False,
     "description": "Aplicação de precisão com barras de 36 metros, corte automático de seções e tecnologia de baixa deriva.",
     "image_url": "https://images.pexels.com/photos/33388413/pexels-photo-33388413.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Diagnóstico AgriScan Pro", "category": "Tecnologia", "featured": False,
     "description": "Scanner de diagnóstico eletrônico multimarca para máquinas agrícolas. Leitura de falhas e telemetria completa em minutos.",
     "image_url": "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxtZWNoYW5pYyUyMGRpYWdub3NpbmclMjBpbmR1c3RyaWFsJTIwZXF1aXBtZW50fGVufDB8fHx8MTc4NzQ0OTg4Mnww&ixlib=rb-4.1.0&q=85"},
    {"name": "Grade Niveladora G40", "category": "Implementos", "featured": False,
     "description": "Implemento robusto para preparo e nivelamento de solo, com controle hidráulico de profundidade e chassi reforçado.",
     "image_url": "https://images.pexels.com/photos/37314899/pexels-photo-37314899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador LG Industrial",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        await db.products.insert_many([{**p, "id": str(uuid.uuid4()), "created_at": now} for p in SEED_PRODUCTS])
        logger.info("Products seeded")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.products.create_index("id", unique=True)
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

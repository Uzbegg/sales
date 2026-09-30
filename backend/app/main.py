from io import BytesIO
from datetime import datetime, timedelta
import base64
import hashlib
import os
import re

from cryptography.fernet import Fernet
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from openpyxl import load_workbook

from telethon import TelegramClient, functions, types, errors
from telethon.sessions import StringSession

from .database import Base, engine, get_db
from .models import Lead, Campaign, TelegramAccount
from .schemas import (
    LeadOut,
    CampaignCreate,
    TelegramLoginStart,
    TelegramLoginConfirm,
    TelegramLeadCheck,
    TelegramSendOne,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Infinity Sales API", version="0.2.0")

allowed_origins = [
    x.strip() for x in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(",") if x.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if not digits:
        return ""
    if digits.startswith("998"):
        return "+" + digits
    if len(digits) == 9:
        return "+998" + digits
    return "+" + digits

def telegram_config():
    raw_id = os.getenv("TELEGRAM_API_ID", "").strip()
    api_hash = os.getenv("TELEGRAM_API_HASH", "").strip()
    if not raw_id or not api_hash:
        raise HTTPException(
            503,
            "Telegram API credentials are not configured on the server"
        )
    try:
        api_id = int(raw_id)
    except ValueError:
        raise HTTPException(500, "TELEGRAM_API_ID must be an integer")
    return api_id, api_hash

def fernet():
    secret = os.getenv("APP_SECRET", "").encode()
    if len(secret) < 16:
        raise HTTPException(503, "APP_SECRET is not configured securely")
    key = base64.urlsafe_b64encode(hashlib.sha256(secret).digest())
    return Fernet(key)

def encrypt_session(value: str) -> str:
    return fernet().encrypt(value.encode()).decode()

def decrypt_session(value: str) -> str:
    if not value:
        return ""
    try:
        return fernet().decrypt(value.encode()).decode()
    except Exception:
        raise HTTPException(500, "Could not decrypt Telegram session")

def get_account_or_404(db: Session, account_id: int) -> TelegramAccount:
    item = db.query(TelegramAccount).filter(TelegramAccount.id == account_id).first()
    if not item:
        raise HTTPException(404, "Telegram account not found")
    return item

def get_lead_or_404(db: Session, lead_id: int) -> Lead:
    item = db.query(Lead).filter(Lead.id == lead_id).first()
    if not item:
        raise HTTPException(404, "Lead not found")
    return item

async def telegram_client_for_account(account: TelegramAccount):
    api_id, api_hash = telegram_config()
    session = decrypt_session(account.session_encrypted)
    client = TelegramClient(StringSession(session), api_id, api_hash)
    await client.connect()
    if not await client.is_user_authorized():
        await client.disconnect()
        raise HTTPException(409, "Telegram account is not authorized")
    return client

@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "0.2.0",
        "telegram_configured": bool(
            os.getenv("TELEGRAM_API_ID") and os.getenv("TELEGRAM_API_HASH")
        ),
    }

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total = db.query(Lead).count()
    telegram_found = db.query(Lead).filter(Lead.telegram_status == "found").count()
    contacted = db.query(Lead).filter(
        Lead.status.in_(["contacted","replied","interested","negotiation","won"])
    ).count()
    replied = db.query(Lead).filter(
        Lead.status.in_(["replied","interested","negotiation","won"])
    ).count()
    return {
        "total_leads": total,
        "telegram_found": telegram_found,
        "contacted": contacted,
        "replied": replied,
    }

@app.get("/leads", response_model=list[LeadOut])
def list_leads(limit: int = 200, db: Session = Depends(get_db)):
    return db.query(Lead).order_by(Lead.id.desc()).limit(min(limit, 1000)).all()

@app.post("/leads/import")
async def import_leads(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(400, "For MVP use an .xlsx file")
    raw = await file.read()
    wb = load_workbook(BytesIO(raw), read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {"imported": 0, "skipped": 0}

    headers = [str(x or "").strip().lower() for x in rows[0]]
    aliases = {
        "company": ["company","компания","название","организация"],
        "first_name": ["first_name","имя","name"],
        "last_name": ["last_name","фамилия","surname"],
        "phone": ["phone","телефон","номер"],
        "city": ["city","город"],
        "category": ["category","категория","тип"],
        "instagram": ["instagram","инстаграм"],
        "website": ["website","site","сайт"],
        "comment": ["comment","комментарий","примечание"],
    }
    idx = {}
    for key, variants in aliases.items():
        for v in variants:
            if v in headers:
                idx[key] = headers.index(v)
                break

    if "phone" not in idx:
        raise HTTPException(400, "Не найдена колонка phone/телефон/номер")

    imported = 0
    skipped = 0
    for row in rows[1:]:
        raw_phone = row[idx["phone"]]
        if isinstance(raw_phone, float) and raw_phone.is_integer():
            raw_phone = int(raw_phone)
        phone = normalize_phone(str(raw_phone or ""))
        if not phone:
            skipped += 1
            continue
        if db.query(Lead).filter(Lead.phone == phone).first():
            skipped += 1
            continue

        def val(name):
            i = idx.get(name)
            return str(row[i] or "").strip() if i is not None and i < len(row) else ""

        db.add(Lead(
            company=val("company"),
            first_name=val("first_name"),
            last_name=val("last_name"),
            phone=phone,
            city=val("city"),
            category=val("category"),
            instagram=val("instagram"),
            website=val("website"),
            comment=val("comment"),
        ))
        imported += 1

    db.commit()
    return {"imported": imported, "skipped": skipped}

@app.post("/campaigns")
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    item = Campaign(
        name=payload.name,
        product=payload.product,
        template=payload.template
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "status": item.status}

@app.get("/campaigns")
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).order_by(Campaign.id.desc()).all()

@app.get("/telegram/config")
def telegram_config_status():
    return {
        "configured": bool(
            os.getenv("TELEGRAM_API_ID") and os.getenv("TELEGRAM_API_HASH")
        ),
        "api_id_present": bool(os.getenv("TELEGRAM_API_ID")),
        "api_hash_present": bool(os.getenv("TELEGRAM_API_HASH")),
    }

@app.get("/telegram/accounts")
def telegram_accounts(db: Session = Depends(get_db)):
    items = db.query(TelegramAccount).order_by(TelegramAccount.id.desc()).all()
    return [{
        "id": x.id,
        "label": x.label,
        "phone": x.phone,
        "status": x.status,
        "telegram_user_id": x.telegram_user_id,
        "telegram_username": x.telegram_username,
        "flood_wait_until": x.flood_wait_until,
        "created_at": x.created_at,
    } for x in items]

@app.post("/telegram/login/start")
async def telegram_login_start(
    payload: TelegramLoginStart,
    db: Session = Depends(get_db)
):
    api_id, api_hash = telegram_config()
    phone = normalize_phone(payload.phone)
    if not phone:
        raise HTTPException(400, "Phone number is required")

    item = db.query(TelegramAccount).filter(TelegramAccount.phone == phone).first()
    if not item:
        item = TelegramAccount(phone=phone, label=payload.label or "Sales Account")
        db.add(item)
        db.commit()
        db.refresh(item)

    client = TelegramClient(StringSession(), api_id, api_hash)
    await client.connect()
    try:
        sent = await client.send_code_request(phone)
        item.session_encrypted = encrypt_session(client.session.save())
        item.pending_phone_code_hash = sent.phone_code_hash or ""
        item.status = "code_sent"
        db.commit()
        return {
            "account_id": item.id,
            "status": "code_sent",
            "phone": phone,
            "timeout": getattr(sent, "timeout", None),
        }
    except errors.FloodWaitError as exc:
        item.status = "flood_wait"
        item.flood_wait_until = datetime.utcnow() + timedelta(seconds=exc.seconds)
        db.commit()
        raise HTTPException(429, f"Telegram FLOOD_WAIT: {exc.seconds} seconds")
    finally:
        await client.disconnect()

@app.post("/telegram/login/confirm")
async def telegram_login_confirm(
    payload: TelegramLoginConfirm,
    db: Session = Depends(get_db)
):
    api_id, api_hash = telegram_config()
    item = get_account_or_404(db, payload.account_id)
    session = decrypt_session(item.session_encrypted)

    client = TelegramClient(StringSession(session), api_id, api_hash)
    await client.connect()
    try:
        try:
            await client.sign_in(
                phone=item.phone,
                code=payload.code,
                phone_code_hash=item.pending_phone_code_hash or None,
            )
        except errors.SessionPasswordNeededError:
            if not payload.password:
                return {
                    "account_id": item.id,
                    "status": "password_required",
                    "needs_password": True,
                }
            await client.sign_in(password=payload.password)

        me = await client.get_me()
        item.session_encrypted = encrypt_session(client.session.save())
        item.pending_phone_code_hash = ""
        item.status = "connected"
        item.flood_wait_until = None
        item.telegram_user_id = str(me.id)
        item.telegram_username = me.username or ""
        db.commit()
        return {
            "account_id": item.id,
            "status": "connected",
            "phone": item.phone,
            "username": item.telegram_username,
            "telegram_user_id": item.telegram_user_id,
        }
    except errors.PhoneCodeInvalidError:
        raise HTTPException(400, "Invalid Telegram code")
    except errors.PhoneCodeExpiredError:
        raise HTTPException(400, "Telegram code expired; request a new one")
    except errors.PasswordHashInvalidError:
        raise HTTPException(400, "Invalid Telegram 2FA password")
    except errors.FloodWaitError as exc:
        item.status = "flood_wait"
        item.flood_wait_until = datetime.utcnow() + timedelta(seconds=exc.seconds)
        db.commit()
        raise HTTPException(429, f"Telegram FLOOD_WAIT: {exc.seconds} seconds")
    finally:
        await client.disconnect()

@app.post("/telegram/check-leads")
async def telegram_check_leads(
    payload: TelegramLeadCheck,
    db: Session = Depends(get_db)
):
    if not payload.lead_ids:
        raise HTTPException(400, "Select at least one lead")

    account = get_account_or_404(db, payload.account_id)
    leads = db.query(Lead).filter(Lead.id.in_(payload.lead_ids)).all()
    if not leads:
        raise HTTPException(404, "No leads found")

    client = await telegram_client_for_account(account)
    try:
        contacts = []
        lead_by_client_id = {}
        for lead in leads:
            if not lead.phone:
                continue
            client_id = int(lead.id)
            lead_by_client_id[client_id] = lead
            contacts.append(types.InputPhoneContact(
                client_id=client_id,
                phone=lead.phone,
                first_name=lead.first_name or lead.company or "Lead",
                last_name=lead.last_name or "",
            ))

        result = await client(functions.contacts.ImportContactsRequest(contacts))
        user_by_id = {str(u.id): u for u in result.users}
        found_ids = set()

        for imported in result.imported:
            lead = lead_by_client_id.get(int(imported.client_id))
            user = user_by_id.get(str(imported.user_id))
            if not lead or not user:
                continue
            found_ids.add(lead.id)
            lead.telegram_status = "found"
            lead.telegram_user_id = str(user.id)
            lead.telegram_access_hash = str(user.access_hash or "")
            lead.telegram_username = user.username or ""

        for lead in leads:
            if lead.id not in found_ids:
                lead.telegram_status = "not_detected"

        db.commit()
        return {
            "checked": len(leads),
            "found": len(found_ids),
            "not_detected": len(leads) - len(found_ids),
            "retry_contacts": list(result.retry_contacts or []),
            "note": (
                "not_detected is not proof that the phone has no Telegram account; "
                "Telegram privacy settings may prevent matching"
            ),
        }
    except errors.FloodWaitError as exc:
        account.status = "flood_wait"
        account.flood_wait_until = datetime.utcnow() + timedelta(seconds=exc.seconds)
        db.commit()
        raise HTTPException(429, f"Telegram FLOOD_WAIT: {exc.seconds} seconds")
    finally:
        await client.disconnect()

@app.post("/telegram/send-one")
async def telegram_send_one(
    payload: TelegramSendOne,
    db: Session = Depends(get_db)
):
    account = get_account_or_404(db, payload.account_id)
    lead = get_lead_or_404(db, payload.lead_id)

    if lead.opt_out:
        raise HTTPException(409, "Lead is marked Do Not Contact")
    if lead.telegram_status != "found":
        raise HTTPException(409, "Telegram is not confirmed for this lead")
    if not lead.telegram_user_id or not lead.telegram_access_hash:
        raise HTTPException(409, "Telegram peer data is incomplete; re-check this lead")

    client = await telegram_client_for_account(account)
    try:
        peer = types.InputPeerUser(
            user_id=int(lead.telegram_user_id),
            access_hash=int(lead.telegram_access_hash),
        )
        sent = await client.send_message(peer, payload.message)
        lead.status = "contacted"
        db.commit()
        return {
            "status": "sent",
            "lead_id": lead.id,
            "message_id": sent.id,
            "sent_at": sent.date,
        }
    except errors.FloodWaitError as exc:
        account.status = "flood_wait"
        account.flood_wait_until = datetime.utcnow() + timedelta(seconds=exc.seconds)
        db.commit()
        raise HTTPException(429, f"Telegram FLOOD_WAIT: {exc.seconds} seconds")
    except errors.PeerFloodError:
        account.status = "limited"
        db.commit()
        raise HTTPException(
            429,
            "Telegram limited new outbound chats for this account"
        )
    except errors.UserPrivacyRestrictedError:
        raise HTTPException(409, "Recipient privacy settings block this message")
    finally:
        await client.disconnect()

@app.get("/inbox")
def inbox():
    return {
        "items": [],
        "note": "Inbound Telegram sync worker is the next backend milestone"
    }

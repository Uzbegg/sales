from pydantic import BaseModel, Field

class LeadOut(BaseModel):
    id: int
    company: str
    first_name: str
    last_name: str
    phone: str
    city: str
    category: str
    telegram_status: str
    telegram_username: str = ""
    telegram_user_id: str = ""
    status: str
    product_interest: str
    opt_out: bool = False

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    name: str
    product: str = ""
    template: str = ""

class TelegramLoginStart(BaseModel):
    phone: str
    label: str = "Sales Account"

class TelegramLoginConfirm(BaseModel):
    account_id: int
    code: str = Field(min_length=3, max_length=12)
    password: str | None = None

class TelegramLeadCheck(BaseModel):
    account_id: int
    lead_ids: list[int]

class TelegramSendOne(BaseModel):
    account_id: int
    lead_id: int
    message: str = Field(min_length=1, max_length=4096)

from pydantic import BaseModel

class LeadOut(BaseModel):
    id: int
    company: str
    first_name: str
    last_name: str
    phone: str
    city: str
    category: str
    telegram_status: str
    status: str
    product_interest: str

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    name: str
    product: str = ""
    template: str = ""

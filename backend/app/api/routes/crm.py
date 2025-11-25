from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db_session
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut
from app.schemas.contact import ContactCreate, ContactUpdate, ContactOut
from app.schemas.deal import DealCreate, DealUpdate, DealOut


router = APIRouter(prefix="/crm", tags=["crm"])


@router.get("/companies", response_model=List[CompanyOut])
def list_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db_session)):
    return db.query(Company).offset(skip).limit(limit).all()


@router.get("/contacts", response_model=List[ContactOut])
def list_contacts(skip: int = 0, limit: int = 100, company_id: Optional[int] = None, db: Session = Depends(get_db_session)):
    q = db.query(Contact)
    if company_id:
        q = q.filter(Contact.company_id == company_id)
    return q.offset(skip).limit(limit).all()


@router.get("/deals", response_model=List[DealOut])
def list_deals(skip: int = 0, limit: int = 100, company_id: Optional[int] = None, stage: Optional[str] = None, db: Session = Depends(get_db_session)):
    q = db.query(Deal)
    if company_id:
        q = q.filter(Deal.company_id == company_id)
    if stage:
        q = q.filter(Deal.stage == stage)
    return q.offset(skip).limit(limit).all()


@router.get("/stats")
def get_crm_stats(db: Session = Depends(get_db_session)):
    total_companies = db.query(Company).count()
    total_contacts = db.query(Contact).count()
    total_deals = db.query(Deal).count()
    return {
        "totalCompanies": total_companies,
        "totalContacts": total_contacts,
        "totalDeals": total_deals,
        "pipelineValue": 0,
        "wonValue": 0,
        "conversionRate": 0,
    }


@router.post("/companies", response_model=CompanyOut)
def create_company(company: CompanyCreate, db: Session = Depends(get_db_session)):
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.post("/contacts", response_model=ContactOut)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db_session)):
    # Convert first_name + last_name to single name field
    contact_data = contact.dict()
    if 'first_name' in contact_data and 'last_name' in contact_data:
        contact_data['name'] = f"{contact_data['first_name']} {contact_data['last_name']}"
        del contact_data['first_name']
        del contact_data['last_name']
    
    # Filter out fields that don't exist in the Contact model
    valid_fields = {'company_id', 'name', 'email', 'phone', 'position'}
    contact_data = {k: v for k, v in contact_data.items() if k in valid_fields}
    
    db_contact = Contact(**contact_data)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.post("/deals", response_model=DealOut)
def create_deal(deal: DealCreate, db: Session = Depends(get_db_session)):
    db_deal = Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal




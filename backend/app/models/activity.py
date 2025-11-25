from sqlalchemy import Column, Integer, String, Enum, Date, Numeric, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class ActivityType(str, enum.Enum):
    branding = "Branding"
    sales = "Sales"
    employer_branding = "Employer Branding"
    kundenpflege = "Kundenpflege"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(Enum(ActivityType), nullable=False)
    budget = Column(Numeric(12, 2), nullable=True)
    expected_output = Column(String(1024), nullable=True)
    weight = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    calendar_entries = relationship("CalendarEntry", back_populates="activity", cascade="all, delete-orphan")



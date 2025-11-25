from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.session import get_db_session
from app.models.calendar import CalendarEntry

router = APIRouter(prefix="/calendar", tags=["calendar"])


# Frontend-compatible schema
class CalendarEventFrontend(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start: str
    end: Optional[str] = None
    type: str = "event"
    attendees: Optional[List[str]] = None
    location: Optional[str] = None
    color: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[CalendarEventFrontend])
def list_calendar_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db_session)
):
    """List all calendar events (no auth required for testing)"""
    try:
        events = db.query(CalendarEntry).offset(skip).limit(limit).all()
        
        result = []
        for event in events:
            result.append(CalendarEventFrontend(
                id=str(event.id),
                title=event.title or "Untitled Event",
                description=getattr(event, 'description', None),
                start=event.start_time.isoformat() if event.start_time else datetime.now().isoformat(),
                end=event.end_time.isoformat() if event.end_time else None,
                type="event",
                attendees=None,
                location=None,
                color=None,
                created_at=event.created_at.isoformat() if event.created_at else None,
                updated_at=event.updated_at.isoformat() if event.updated_at else None
            ))
        
        return result
    except Exception as e:
        print(f"Error fetching calendar events: {e}")
        return []


@router.post("", response_model=CalendarEventFrontend)
def create_calendar_event(
    event_data: dict,
    db: Session = Depends(get_db_session)
):
    """Create a new calendar event (no auth required for testing)"""
    try:
        start_time = datetime.fromisoformat(event_data['start'].replace('Z', '+00:00')) if 'start' in event_data else datetime.now()
        end_time = datetime.fromisoformat(event_data['end'].replace('Z', '+00:00')) if 'end' in event_data and event_data['end'] else None
        
        if end_time is None:
            # Ensure end_time is set to start_time when not provided to satisfy NOT NULL
            end_time = start_time

        event = CalendarEntry(
            title=event_data.get('title', 'Untitled Event'),
            description=event_data.get('description'),
            start_time=start_time,
            end_time=end_time
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        
        return CalendarEventFrontend(
            id=str(event.id),
            title=event.title,
            description=event.description,
            start=event.start_time.isoformat(),
            end=event.end_time.isoformat() if event.end_time else None,
            type=event_data.get('type', 'event'),
            attendees=event_data.get('attendees'),
            location=event_data.get('location'),
            color=event_data.get('color'),
            created_at=event.created_at.isoformat() if event.created_at else None,
            updated_at=event.updated_at.isoformat() if event.updated_at else None
        )
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{event_id}", response_model=CalendarEventFrontend)
def update_calendar_event(
    event_id: str,
    event_data: dict,
    db: Session = Depends(get_db_session)
):
    """Update a calendar event (no auth required for testing)"""
    try:
        event = db.query(CalendarEntry).filter(CalendarEntry.id == int(event_id)).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if 'title' in event_data:
            event.title = event_data['title']
        if 'description' in event_data:
            event.description = event_data.get('description')
        if 'start' in event_data:
            event.start_time = datetime.fromisoformat(event_data['start'].replace('Z', '+00:00'))
        if 'end' in event_data and event_data['end']:
            event.end_time = datetime.fromisoformat(event_data['end'].replace('Z', '+00:00'))
        
        db.commit()
        db.refresh(event)
        
        return CalendarEventFrontend(
            id=str(event.id),
            title=event.title,
            description=event.description,
            start=event.start_time.isoformat(),
            end=event.end_time.isoformat() if event.end_time else None,
            type=event_data.get('type', 'event'),
            attendees=event_data.get('attendees'),
            location=event_data.get('location'),
            color=event_data.get('color'),
            created_at=event.created_at.isoformat() if event.created_at else None,
            updated_at=event.updated_at.isoformat() if event.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{event_id}")
def delete_calendar_event(
    event_id: str,
    db: Session = Depends(get_db_session)
):
    """Delete a calendar event (no auth required for testing)"""
    try:
        event = db.query(CalendarEntry).filter(CalendarEntry.id == int(event_id)).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        db.delete(event)
        db.commit()
        return {"ok": True, "message": "Event deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

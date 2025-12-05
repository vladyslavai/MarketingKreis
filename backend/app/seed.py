import bcrypt
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.activity import Activity, ActivityType
from app.models.performance import Performance
from app.models.calendar import CalendarEntry  # ensure model is registered


def _hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def seed() -> None:
    # Ensure tables exist (especially for fresh SQLite DBs)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠️ Could not create tables before seeding: {e}")

    db: Session = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@marketingkreis.ch").first():
            admin = User(
                email="admin@marketingkreis.ch",
                role=UserRole.admin,
                hashed_password=_hash_password("password123"),
            )
            db.add(admin)
            print("✓ Created admin user: admin@marketingkreis.ch / password123")

        if db.query(Activity).count() == 0:
            activities = [
                Activity(title="Brand Campaign Q1", type=ActivityType.branding, budget=20000, status="Planned"),
                Activity(title="Sales Push March", type=ActivityType.sales, budget=15000, status="Active"),
                Activity(title="Employer Branding Fair", type=ActivityType.employer_branding, budget=8000, status="Planned"),
                Activity(title="Kundenpflege Newsletter", type=ActivityType.kundenpflege, budget=3000, status="Active"),
            ]
            db.add_all(activities)
            print(f"✓ Created {len(activities)} sample activities")

        db.commit()

        # Seed some performance data if empty
        any_activity = db.query(Activity).first()
        if any_activity and db.query(Performance).count() == 0:
            for i in range(1, 9):
                db.add(Performance(activity_id=any_activity.id, leads=10*i, impressions=1000*i, reach=800*i, spend=250.0*i))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()



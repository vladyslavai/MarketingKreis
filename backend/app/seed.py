from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.activity import Activity, ActivityType
from app.core.security import get_password_hash
from app.models.performance import Performance


def seed() -> None:
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@marketingkreis.ch").first():
            admin = User(
                name="Admin User",
                email="admin@marketingkreis.ch",
                role=UserRole.admin,
                password_hash=get_password_hash("password123"),
                token_version=0
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



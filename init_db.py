from app import app, db
from models import User, Customer, Transaction, InterestRate, TDSRate
from werkzeug.security import generate_password_hash
from datetime import date, datetime
from decimal import Decimal

def init_database():
    """Initialize database with default data"""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create default users if they don't exist
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': 'admin123',
                'role': 'admin'
            },
            {
                'username': 'dataentry',
                'email': 'dataentry@example.com',
                'password': 'data123',
                'role': 'data_entry'
            },
            {
                'username': 'user',
                'email': 'user@example.com',
                'password': 'user123',
                'role': 'normal_user'
            }
        ]
        
        for user_data in users_data:
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if not existing_user:
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    password_hash=generate_password_hash(user_data['password']),
                    role=user_data['role']
                )
                db.session.add(user)
        
        # Create default interest rate
        existing_rate = InterestRate.query.filter_by(is_active=True).first()
        if not existing_rate:
            rate = InterestRate(
                rate=Decimal('15.50'),
                effective_date=date.today(),
                description='Default interest rate',
                created_by=1
            )
            db.session.add(rate)
        
        # Create default TDS rate
        existing_tds = TDSRate.query.filter_by(is_active=True).first()
        if not existing_tds:
            tds_rate = TDSRate(
                rate=Decimal('10.00'),
                effective_date=date.today(),
                description='Default TDS rate',
                created_by=1
            )
            db.session.add(tds_rate)
        
        db.session.commit()
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_database()

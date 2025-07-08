from app import db
from flask_login import UserMixin
from datetime import datetime
from decimal import Decimal

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    role = db.Column(db.String(20), default='normal_user')  # normal_user, data_entry, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<User {self.username}>'

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    icl_no = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text)
    contact_details = db.Column(db.String(200))
    annual_rate = db.Column(db.Numeric(5, 2), nullable=False)  # e.g., 15.50
    icl_start_date = db.Column(db.Date, nullable=False)
    icl_end_date = db.Column(db.Date)
    icl_extension = db.Column(db.String(100))
    tds_applicable = db.Column(db.Boolean, default=False)
    interest_type = db.Column(db.String(20), default='simple')  # simple, compound
    compound_frequency = db.Column(db.String(20))  # monthly, quarterly, yearly
    first_compounding_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    transactions = db.relationship('Transaction', backref='customer', lazy=True, cascade='all, delete-orphan')
    
    @property
    def current_balance(self):
        """Calculate current balance based on transactions"""
        total_paid = sum(float(t.amount_paid or 0) for t in self.transactions if t.amount_paid)
        total_repaid = sum(float(t.amount_repaid or 0) for t in self.transactions if t.amount_repaid)
        return total_paid - total_repaid
    
    def get_current_balance(self):
        """Calculate current balance based on transactions (method version for backward compatibility)"""
        return self.current_balance

    def __repr__(self):
        return f'<Customer {self.name}>'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    amount_paid = db.Column(db.Numeric(15, 2))
    amount_repaid = db.Column(db.Numeric(15, 2))
    balance = db.Column(db.Numeric(15, 2))
    period_from = db.Column(db.Date)
    period_to = db.Column(db.Date)
    no_of_days = db.Column(db.Integer)
    int_rate = db.Column(db.Numeric(5, 2))
    int_amount = db.Column(db.Numeric(15, 2))
    tds_amount = db.Column(db.Numeric(15, 2))
    net_amount = db.Column(db.Numeric(15, 2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f'<Transaction {self.date} - {self.customer.name}>'

class InterestRate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rate = db.Column(db.Numeric(5, 2), nullable=False)
    effective_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<InterestRate {self.rate}% from {self.effective_date}>'

class TDSRate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rate = db.Column(db.Numeric(5, 2), nullable=False, default=10.0)  # Default 10% TDS
    effective_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<TDSRate {self.rate}% from {self.effective_date}>'

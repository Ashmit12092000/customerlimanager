# Loan Management System

## Overview

This is a Flask-based loan management system that handles customer information, transaction tracking, and interest calculations. The system supports both simple and compound interest calculations with role-based access control for different user types.

## System Architecture

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite (default) with PostgreSQL compatibility
- **Authentication**: Flask-Login with role-based access control
- **Session Management**: Flask sessions with configurable secret key

### Frontend Architecture
- **Template Engine**: Jinja2 templates
- **CSS Framework**: Bootstrap 5 with dark theme
- **JavaScript**: Vanilla JS with jQuery for enhanced functionality
- **Icons**: Font Awesome 6.0

### Data Storage
- **Database**: SQLAlchemy with DeclarativeBase
- **Models**: User, Customer, Transaction, InterestRate, TDSRate
- **Connection Pooling**: Configured with pool_recycle and pool_pre_ping

## Key Components

### User Management
- **Role-based Access Control**: Admin, Data Entry, Normal User
- **Authentication**: Username/password with hashed passwords
- **Session Management**: Persistent login with Flask-Login

### Customer Management
- **Customer Master**: ICL number, personal details, interest configuration
- **Interest Types**: Simple and compound interest support
- **TDS Support**: Tax deduction at source calculations
- **Balance Tracking**: Real-time balance calculations

### Transaction System
- **Payment Tracking**: Amount paid and repaid transactions
- **Interest Calculations**: Automatic interest computation
- **Transaction History**: Complete audit trail

### Reporting System
- **Customer Reports**: Individual customer transaction history
- **Period Reports**: Date-range based consolidated reports
- **Excel Export**: Formatted Excel reports with styling

## Data Flow

1. **User Authentication**: Login → Role validation → Dashboard access
2. **Customer Creation**: Admin/Data Entry → Customer Master → Database
3. **Transaction Processing**: Input → Validation → Interest Calculation → Storage
4. **Report Generation**: Query → Calculation → Format → Export

## External Dependencies

### Python Packages
- Flask framework stack (Flask, Flask-SQLAlchemy, Flask-Login)
- Database libraries (SQLAlchemy, database drivers)
- Excel generation (openpyxl, pandas)
- Security utilities (werkzeug.security)

### Frontend Libraries
- Bootstrap 5 (CSS framework)
- Font Awesome (icons)
- DataTables (table enhancement)
- jQuery (JavaScript utilities)

### Database Support
- SQLite (development/default)
- PostgreSQL (production ready)
- Connection pooling and health checks

## Deployment Strategy

### Environment Configuration
- **SESSION_SECRET**: Session security key
- **DATABASE_URL**: Database connection string
- **Debug Mode**: Configurable for development/production

### Production Considerations
- ProxyFix middleware for HTTPS support
- Database connection pooling
- Environment-based configuration
- Logging configuration

### Default Setup
- Automatic database initialization
- Default user creation (admin, dataentry, user)
- Sample data population
- Table creation on startup

## Changelog

- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
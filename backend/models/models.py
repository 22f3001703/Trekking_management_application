from database import db
import datetime
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='trekker') 
    status = db.Column(db.Integer, nullable=False, default=1)  
    phone = db.Column(db.String(15), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    bookings = db.relationship('Booking', backref='user', lazy=True)
    staff_profile = db.relationship('StaffProfile', backref='user', uselist=False, lazy=True)
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
class Trek(db.Model):
    __tablename__ = 'trek'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False, default='Moderate') 
    duration_days = db.Column(db.Integer, nullable=False)
    available_slots = db.Column(db.Integer, nullable=False, default=0)
    price = db.Column(db.Float, nullable=True, default=0.0)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(256), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Pending')  
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    assigned_staff = db.relationship('User', backref='assigned_treks', foreign_keys=[assigned_staff_id])
    bookings = db.relationship('Booking', backref='trek', lazy=True)
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'difficulty': self.difficulty,
            'duration_days': self.duration_days,
            'available_slots': self.available_slots,
            'price': self.price,
            'description': self.description,
            'image': self.image,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'assigned_staff_id': self.assigned_staff_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    trek_id = db.Column(db.Integer, db.ForeignKey('trek.id'), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='Booked') 
    payment_status = db.Column(db.String(20), nullable=True, default='Pending')  
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    __table_args__ = (
        db.UniqueConstraint('user_id', 'trek_id', name='uq_user_trek'),
    )
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trek_id': self.trek_id,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'status': self.status,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
class StaffProfile(db.Model):
    __tablename__ = 'staff_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    specialization = db.Column(db.String(150), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True, default=0)
    bio = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(15), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialization': self.specialization,
            'experience_years': self.experience_years,
            'bio': self.bio,
            'emergency_contact': self.emergency_contact,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

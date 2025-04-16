from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    records = db.relationship('Record', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

class Record(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    record_type = db.Column(db.String(50))  # 'weather' o 'seismic'
    data = db.Column(db.Text)              # Guarda JSON como texto
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Record {self.record_type} for user {self.user_id} at {self.timestamp}>'

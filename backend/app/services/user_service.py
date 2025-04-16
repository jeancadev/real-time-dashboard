from werkzeug.security import generate_password_hash, check_password_hash
from app.models.data_models import db, User

def create_user(username, password):
    if User.query.filter_by(username=username).first():
        return None  # Usuario ya existe
    user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(user)
    try:
        db.session.commit()
    except Exception as e:
        print("Error during commit:", e)
        db.session.rollback()
        raise e
    return user

def authenticate_user(username, password):
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return user
    return None

from flask import Blueprint, request, jsonify
from app.services.user_service import create_user, authenticate_user
import jwt
import datetime
from app.core.config import SECRET_KEY

users_bp = Blueprint('users', __name__)

@users_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    user = create_user(username, password)
    if user is None:
        return jsonify({"error": "Username already exists"}), 400
    return jsonify({"message": "User created successfully", "username": user.username}), 201

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = authenticate_user(username, password)
    if user is None:
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')

    return jsonify({"token": token})

import jwt
from functools import wraps
from flask import request, jsonify
from app.core.config import SECRET_KEY

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({"message": "Token is missing!"}), 401
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

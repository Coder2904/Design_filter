from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import jwt
import datetime
from functools import wraps
from flask import request, jsonify
import os

class AuthManager:
    """Handle Google OAuth and JWT token management"""
    
    def __init__(self, app):
        self.app = app
        self.google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.secret_key = app.config.get('SECRET_KEY') or os.getenv('SECRET_KEY')
        
        # Ensure secret_key is a string
        if not self.secret_key or not isinstance(self.secret_key, str):
            print("WARNING: SECRET_KEY not properly set! Using fallback.")
            self.secret_key = 'fallback-secret-key-please-change-in-env-file'
        
        print(f"[AuthManager] Initialized with secret_key: {self.secret_key[:10]}...")
    
    def verify_google_token(self, token):
        """Verify Google ID token and return user info"""
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                self.google_client_id
            )
            
            # Verify token is for our app
            if idinfo['aud'] != self.google_client_id:
                raise ValueError('Invalid audience')
            
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture')
            }
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            return None
    
    def generate_jwt(self, user_id):
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_jwt(self, token):
        """Verify JWT token and return user_id"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

# Decorator for protected routes
def login_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
            
            # Get auth manager from app context
            from flask import current_app
            auth_manager = current_app.auth_manager
            
            user_id = auth_manager.verify_jwt(token)
            if not user_id:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user_id to request context
            request.user_id = user_id
            
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'details': str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function
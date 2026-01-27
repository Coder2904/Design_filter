from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    """User model for storing user information"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    picture = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with filter designs
    designs = db.relationship('FilterDesign', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'design_count': len(self.designs)
        }

class FilterDesign(db.Model):
    """Model for storing filter designs"""
    __tablename__ = 'filter_designs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Design metadata
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Filter specifications (stored as JSON)
    filter_class = db.Column(db.String(10))  # 'fir' or 'iir'
    filter_type = db.Column(db.String(20))   # 'lowpass', 'highpass', etc.
    method = db.Column(db.String(50))
    specifications = db.Column(db.Text)  # JSON string of all parameters
    
    # Filter results (stored as JSON)
    coefficients = db.Column(db.Text)  # JSON: {b: [...], a: [...]}
    responses = db.Column(db.Text)     # JSON: frequency, impulse, step responses
    
    # Tags for organization
    tags = db.Column(db.String(500))  # Comma-separated tags
    is_favorite = db.Column(db.Boolean, default=False)
    
    def to_dict(self, include_details=False):
        base_dict = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'filter_class': self.filter_class,
            'filter_type': self.filter_type,
            'method': self.method,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tags': self.tags.split(',') if self.tags else [],
            'is_favorite': self.is_favorite
        }
        
        if include_details:
            base_dict['specifications'] = json.loads(self.specifications) if self.specifications else {}
            base_dict['coefficients'] = json.loads(self.coefficients) if self.coefficients else {}
            base_dict['responses'] = json.loads(self.responses) if self.responses else {}
        
        return base_dict
    
    @staticmethod
    def from_design_data(user_id, name, description, params, results):
        """Create a FilterDesign from design parameters and results"""
        design = FilterDesign()
        design.user_id = user_id
        design.name = name
        design.description = description
        design.filter_class = params.get('filter_class')
        design.filter_type = params.get('filter_type')
        design.method = params.get('method')
        design.specifications = json.dumps(params)
        design.coefficients = json.dumps(results.get('coefficients', {}))
        design.responses = json.dumps({
            'frequency_response': results.get('frequency_response', {}),
            'impulse_response': results.get('impulse_response', []),
            'step_response': results.get('step_response', []),
            'pole_zero': results.get('pole_zero', {})
        })
        return design
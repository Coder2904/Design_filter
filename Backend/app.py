from flask import Flask, request, jsonify
from flask_cors import CORS
from dsp_engine import FilterDesigner
from models import db, User, FilterDesign
from auth import AuthManager, login_required
from datetime import datetime
import traceback
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///filter_designs.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Debug: Print to verify SECRET_KEY is loaded
print(f"SECRET_KEY loaded: {app.config['SECRET_KEY'][:10]}..." if app.config['SECRET_KEY'] else "SECRET_KEY NOT LOADED!")
print(f"GOOGLE_CLIENT_ID loaded: {os.getenv('GOOGLE_CLIENT_ID', 'NOT FOUND')[:20]}...")

# Initialize extensions
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')], supports_credentials=True)
db.init_app(app)
auth_manager = AuthManager(app)
app.auth_manager = auth_manager

# Initialize DSP engine
designer = FilterDesigner()

# Create tables
with app.app_context():
    db.create_all()
    print("✅ Database initialized")

# ============= Authentication Routes =============

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    """Handle Google OAuth login"""
    try:
        data = request.json
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'error': 'No token provided'}), 400
        
        # Verify Google token
        user_info = auth_manager.verify_google_token(google_token)
        if not user_info:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        # Find or create user
        user = User.query.filter_by(google_id=user_info['google_id']).first()
        
        if not user:
            # Create new user
            user = User(
                google_id=user_info['google_id'],
                email=user_info['email'],
                name=user_info['name'],
                picture=user_info['picture']
            )
            db.session.add(user)
        else:
            # Update last login
            user.last_login = datetime.now()
            user.name = user_info['name']
            user.picture = user_info['picture']
        
        db.session.commit()
        
        # Generate JWT token
        jwt_token = auth_manager.generate_jwt(user.id)
        
        return jsonify({
            'success': True,
            'token': jwt_token,
            'user': user.to_dict()
        })
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
@login_required
def verify_token():
    """Verify if user's token is valid"""
    user = User.query.get(request.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    })

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout user (client should delete token)"""
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# ============= Filter Design Routes =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'DSP Engine running'})

@app.route('/api/design-filter', methods=['POST'])
@login_required
def design_filter():
    """Design a filter (requires authentication)"""
    try:
        params = request.json
        
        # Validate inputs
        errors = designer.validate_inputs(params)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        filter_class = params.get('filter_class', 'fir')
        
        # Design filter
        if filter_class == 'fir':
            result = designer.design_fir(params)
        elif filter_class == 'iir':
            result = designer.design_iir(params)
        else:
            return jsonify({'error': f'Unknown filter class: {filter_class}'}), 400
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': 'Filter design failed',
            'details': str(e)
        }), 500

# ============= Design Management Routes =============

@app.route('/api/designs', methods=['GET'])
@login_required
def get_designs():
    """Get all designs for the current user"""
    try:
        user_id = request.user_id
        designs = FilterDesign.query.filter_by(user_id=user_id).order_by(FilterDesign.updated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'designs': [design.to_dict() for design in designs]
        })
    except Exception as e:
        return jsonify({'error': 'Failed to fetch designs', 'details': str(e)}), 500

@app.route('/api/designs/<int:design_id>', methods=['GET'])
@login_required
def get_design(design_id):
    """Get a specific design with full details"""
    try:
        design = FilterDesign.query.filter_by(id=design_id, user_id=request.user_id).first()
        
        if not design:
            return jsonify({'error': 'Design not found'}), 404
        
        return jsonify({
            'success': True,
            'design': design.to_dict(include_details=True)
        })
    except Exception as e:
        return jsonify({'error': 'Failed to fetch design', 'details': str(e)}), 500

@app.route('/api/designs', methods=['POST'])
@login_required
def save_design():
    """Save a new filter design"""
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description', '')
        params = data.get('parameters')
        results = data.get('results')
        tags = data.get('tags', [])
        
        if not name or not params or not results:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create new design
        design = FilterDesign.from_design_data(
            user_id=request.user_id,
            name=name,
            description=description,
            params=params,
            results=results
        )
        design.tags = ','.join(tags) if tags else ''
        
        db.session.add(design)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'design': design.to_dict(),
            'message': 'Design saved successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save design', 'details': str(e)}), 500

@app.route('/api/designs/<int:design_id>', methods=['PUT'])
@login_required
def update_design(design_id):
    """Update an existing design"""
    try:
        design = FilterDesign.query.filter_by(id=design_id, user_id=request.user_id).first()
        
        if not design:
            return jsonify({'error': 'Design not found'}), 404
        
        data = request.json
        
        # Update fields
        if 'name' in data:
            design.name = data['name']
        if 'description' in data:
            design.description = data['description']
        if 'tags' in data:
            design.tags = ','.join(data['tags']) if data['tags'] else ''
        if 'is_favorite' in data:
            design.is_favorite = data['is_favorite']
        
        design.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'design': design.to_dict(),
            'message': 'Design updated successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update design', 'details': str(e)}), 500

@app.route('/api/designs/<int:design_id>', methods=['DELETE'])
@login_required
def delete_design(design_id):
    """Delete a design"""
    try:
        design = FilterDesign.query.filter_by(id=design_id, user_id=request.user_id).first()
        
        if not design:
            return jsonify({'error': 'Design not found'}), 404
        
        db.session.delete(design)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Design deleted successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete design', 'details': str(e)}), 500

# ============= Export Route =============

@app.route('/api/export-coefficients', methods=['POST'])
@login_required
def export_coefficients():
    """Export filter coefficients in various formats"""
    try:
        data = request.json
        coeffs = data.get('coefficients')
        export_format = data.get('format', 'text')
        
        result = designer.export_coefficients(coeffs, export_format)
        
        return jsonify({
            'success': True,
            'exported': result
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Export failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 DSP Filter Design Engine starting...")
    print("📡 Available endpoints:")
    print("  Auth:")
    print("    - POST /api/auth/google")
    print("    - GET  /api/auth/verify")
    print("    - POST /api/auth/logout")
    print("  Design:")
    print("    - POST /api/design-filter")
    print("    - GET  /api/designs")
    print("    - GET  /api/designs/<id>")
    print("    - POST /api/designs")
    print("    - PUT  /api/designs/<id>")
    print("    - DELETE /api/designs/<id>")
    print("    - POST /api/export-coefficients")
    app.run(debug=True, port=5000)
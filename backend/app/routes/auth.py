from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'msg': 'Aucune donnée fournie'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'ranger').strip()
        
        if not username or not password:
            return jsonify({'msg': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        if len(password) < 6:
            return jsonify({'msg': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'Ce nom d\'utilisateur existe déjà'}), 409
        
        # Créer le nouvel utilisateur
        user = User(username=username, role=role)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'msg': 'Utilisateur créé avec succès'}), 201
        
    except Exception as e:
        print(f"Error in register: {e}")
        db.session.rollback()
        return jsonify({'msg': 'Erreur lors de la création du compte'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'msg': 'Aucune donnée fournie'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'msg': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        # Chercher l'utilisateur
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'msg': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401
        
        # Créer le token avec seulement l'ID utilisateur comme identité (string)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }), 200
        
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({'msg': 'Erreur lors de la connexion'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Route pour obtenir les informations de l'utilisateur connecté"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'msg': 'Utilisateur non trouvé'}), 404
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role
        }), 200
        
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        return jsonify({'msg': 'Erreur lors de la récupération des informations utilisateur'}), 500
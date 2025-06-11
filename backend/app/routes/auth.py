from flask import Blueprint,request,jsonify
from app import db
from app.models import User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth',__name__)

@auth_bp.route('/register',methods=['POST'])
def register():
    data=request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify(msg='Username exists'),409
    u=User(username=data['username'],role=data.get('role','ranger'))
    u.set_password(data['password'])
    db.session.add(u);db.session.commit()
    return jsonify(msg='User created'),201

@auth_bp.route('/login',methods=['POST'])
def login():
    d=request.get_json();u=User.query.filter_by(username=d['username']).first()
    if not u or not u.check_password(d['password']): return jsonify(msg='Bad creds'),401
    at=create_access_token(identity={'id':u.id,'role':u.role})
    return jsonify(access_token=at),200
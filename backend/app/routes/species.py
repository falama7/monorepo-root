from flask import Blueprint,request,jsonify
from flask_jwt_extended import jwt_required,get_jwt_identity
from app import db
from app.models import Species

species_bp=Blueprint('species',__name__)

@species_bp.route('',methods=['GET'])
@jwt_required()
def list_species():
    return jsonify([{'id':s.id,'common_name':s.common_name,'scientific_name':s.scientific_name,'description':s.description} for s in Species.query.all()])

@species_bp.route('',methods=['POST'])
@jwt_required()
def create():
    p=request.get_json();uid=get_jwt_identity()['id']
    s=Species(common_name=p['common_name'],scientific_name=p['scientific_name'],description=p.get('description',''),created_by=uid)
    db.session.add(s);db.session.commit();return jsonify(id=s.id),201
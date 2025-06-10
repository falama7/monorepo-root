from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Species
from app import db

species_bp = Blueprint('species', __name__)

@species_bp.route('', methods=['GET'])
@jwt_required()
def get_species():
    data = Species.query.all()
    return jsonify([
        {
            'id': s.id,
            'common_name': s.common_name,
            'scientific_name': s.scientific_name,
            'description': s.description
        } for s in data
    ]), 200

@species_bp.route('', methods=['POST'])
@jwt_required()
def create_species():
    payload = request.get_json()
    identity = get_jwt_identity()
    s = Species(
        common_name=payload.get('common_name'),
        scientific_name=payload.get('scientific_name'),
        description=payload.get('description'),
        created_by=identity['id']
    )
    db.session.add(s)
    db.session.commit()
    return jsonify({'msg': 'Species created', 'id': s.id}), 201

@species_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_species(id):
    payload = request.get_json()
    s = Species.query.get_or_404(id)
    s.common_name = payload.get('common_name', s.common_name)
    s.scientific_name = payload.get('scientific_name', s.scientific_name)
    s.description = payload.get('description', s.description)
    db.session.commit()
    return jsonify({'msg': 'Species updated'}), 200

@species_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_species(id):
    s = Species.query.get_or_404(id)
    db.session.delete(s)
    db.session.commit()
    return jsonify({'msg': 'Species deleted'}), 200
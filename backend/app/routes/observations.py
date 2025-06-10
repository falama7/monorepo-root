from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Observation
from app import db

obs_bp = Blueprint('observations', __name__)

@obs_bp.route('', methods=['GET'])
@jwt_required()
def list_obs():
    data = Observation.query.all()
    return jsonify([
        {
            'id': o.id,
            'species_id': o.species_id,
            'latitude': o.latitude,
            'longitude': o.longitude,
            'observed_at': o.observed_at.isoformat(),
            'notes': o.notes
        } for o in data
    ]), 200

@obs_bp.route('', methods=['POST'])
@jwt_required()
def add_obs():
    payload = request.get_json()
    o = Observation(
        species_id=payload['species_id'],
        latitude=payload['latitude'],
        longitude=payload['longitude'],
        observed_at=payload.get('observed_at'),
        notes=payload.get('notes', '')
    )
    db.session.add(o)
    db.session.commit()
    return jsonify({'msg': 'Observation added', 'id': o.id}), 201
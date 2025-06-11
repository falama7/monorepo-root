from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Observation

obs_bp = Blueprint('obs', __name__)

@obs_bp.route('', methods=['GET'])
@jwt_required()
def get_obs():
    try:
        args = request.args
        query = Observation.query
        
        # Filtres optionnels
        if args.get('species'):
            try:
                species_id = int(args['species'])
                query = query.filter_by(species_id=species_id)
            except ValueError:
                return jsonify({'msg': 'ID d\'espèce invalide'}), 400
        
        if args.get('from'):
            try:
                query = query.filter(Observation.observed_at >= args['from'])
            except Exception:
                return jsonify({'msg': 'Format de date invalide'}), 400
        
        observations = query.all()
        
        result = []
        for obs in observations:
            result.append({
                'id': obs.id,
                'species_id': obs.species_id,
                'lat': obs.latitude,
                'lng': obs.longitude,
                'latitude': obs.latitude,  # Pour compatibilité
                'longitude': obs.longitude,  # Pour compatibilité
                'observed_at': obs.observed_at.isoformat(),
                'notes': obs.notes
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in get_obs: {e}")
        return jsonify({'msg': 'Erreur lors de la récupération des observations'}), 500

@obs_bp.route('', methods=['POST'])
@jwt_required()
def add_obs():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'msg': 'Aucune donnée fournie'}), 400
        
        # Validation des champs requis
        required_fields = ['species_id', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'msg': f'Champ requis manquant: {field}'}), 400
        
        try:
            species_id = int(data['species_id'])
            latitude = float(data['latitude'])
            longitude = float(data['longitude'])
        except (ValueError, TypeError):
            return jsonify({'msg': 'Valeurs numériques invalides'}), 400
        
        # Validation des coordonnées
        if not (-90 <= latitude <= 90):
            return jsonify({'msg': 'Latitude invalide (doit être entre -90 et 90)'}), 400
        
        if not (-180 <= longitude <= 180):
            return jsonify({'msg': 'Longitude invalide (doit être entre -180 et 180)'}), 400
        
        observation = Observation(
            species_id=species_id,
            latitude=latitude,
            longitude=longitude,
            notes=data.get('notes', '')
        )
        
        db.session.add(observation)
        db.session.commit()
        
        return jsonify({
            'id': observation.id,
            'msg': 'Observation créée avec succès'
        }), 201
        
    except Exception as e:
        print(f"Error in add_obs: {e}")
        db.session.rollback()
        return jsonify({'msg': 'Erreur lors de la création de l\'observation'}), 500
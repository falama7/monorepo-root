from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Species, Observation
from sqlalchemy import func

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/population', methods=['GET'])
@jwt_required()
def pop():
    print("=== GET /api/stats/population called ===")
    try:
        print("Querying population data...")
        
        # Approche simple : compter les observations par espèce
        observations = db.session.query(
            Observation.species_id, 
            func.count(Observation.id).label('count')
        ).group_by(Observation.species_id).all()
        
        print(f"Found {len(observations)} species with observations")
        
        result = []
        for species_id, count in observations:
            # Récupérer le nom de l'espèce
            species = Species.query.get(species_id)
            if species:
                result.append({
                    'species': species.common_name or f"Espèce {species_id}",
                    'count': count
                })
        
        print(f"Returning {len(result)} population records")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error in population stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'msg': 'Erreur lors de la récupération des statistiques de population', 'error': str(e)}), 500

@stats_bp.route('/timeline', methods=['GET'])
@jwt_required()
def timeline():
    print("=== GET /api/stats/timeline called ===")
    try:
        print("Querying timeline data...")
        
        # Vérifier d'abord s'il y a des observations
        observation_count = Observation.query.count()
        print(f"Total observations: {observation_count}")
        
        if observation_count == 0:
            print("No observations found, returning empty array")
            return jsonify([]), 200
        
        # Requête simplifiée pour la timeline
        data = db.session.query(
            func.date_trunc('month', Observation.observed_at).label('month'),
            func.count(Observation.id).label('count')
        ).group_by('month').order_by('month').all()
        
        print(f"Found {len(data)} monthly records")
        
        result = []
        for month, count in data:
            result.append({
                'month': month.isoformat() if month else 'Unknown',
                'count': count
            })
        
        print(f"Returning {len(result)} timeline records")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error in timeline stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'msg': 'Erreur lors de la récupération des statistiques temporelles', 'error': str(e)}), 500
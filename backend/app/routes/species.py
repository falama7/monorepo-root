from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Species

species_bp = Blueprint('species', __name__)

@species_bp.route('', methods=['GET'])
@jwt_required()
def list_species():
    print("=== GET /api/species called ===")
    try:
        print("Querying species...")
        species_list = Species.query.all()
        print(f"Found {len(species_list)} species")
        
        result = []
        for s in species_list:
            result.append({
                'id': s.id,
                'common_name': s.common_name,
                'scientific_name': s.scientific_name,
                'description': s.description or ''
            })
        
        print(f"Returning {len(result)} species")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error in list_species: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'msg': 'Erreur lors de la récupération des espèces', 'error': str(e)}), 500

@species_bp.route('', methods=['POST'])
@jwt_required()
def create_species():
    print("=== POST /api/species called ===")
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            print("❌ No data provided")
            return jsonify({'msg': 'Aucune donnée fournie'}), 400
            
        common_name = data.get('common_name', '').strip()
        scientific_name = data.get('scientific_name', '').strip()
        
        if not common_name or not scientific_name:
            print(f"❌ Missing required fields: common_name='{common_name}', scientific_name='{scientific_name}'")
            return jsonify({'msg': 'Nom commun et nom scientifique requis'}), 400
        
        print("Getting user identity...")
        user_id_str = get_jwt_identity()  # Maintenant c'est un string
        user_id = int(user_id_str)  # Convertir en entier
        print(f"User ID: {user_id}")
        
        print("Creating species...")
        species = Species(
            common_name=common_name,
            scientific_name=scientific_name,
            description=data.get('description', '').strip(),
            created_by=user_id
        )
        
        print("Adding to database...")
        db.session.add(species)
        db.session.commit()
        
        print(f"✅ Species created with ID: {species.id}")
        return jsonify({
            'id': species.id,
            'msg': 'Espèce créée avec succès'
        }), 201
        
    except Exception as e:
        print(f"❌ Error in create_species: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'msg': 'Erreur lors de la création de l\'espèce', 'error': str(e)}), 500
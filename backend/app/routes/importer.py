from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import pandas as pd
from app.models import Species
from app import db

importer_bp = Blueprint('importer', __name__)

@importer_bp.route('/import', methods=['POST'])
@jwt_required()
def import_species():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file provided'}), 400
    f = request.files['file']
    try:
        df = pd.read_excel(f)
    except:
        try:
            df = pd.read_csv(f)
        except Exception:
            return jsonify({'msg': 'Invalid file format'}), 400
    created = []
    for _, row in df.iterrows():
        s = Species(
            common_name=row.get('common_name') or row.get('Nom commun'),
            scientific_name=row.get('scientific_name') or row.get('Nom scientifique'),
            description=row.get('description') or ''
        )
        db.session.add(s)
        created.append(s.common_name)
    db.session.commit()
    return jsonify({'msg': 'Imported', 'count': len(created)}), 201
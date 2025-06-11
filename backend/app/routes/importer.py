from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Species
from app import db
import pandas as pd
import io

importer_bp = Blueprint('importer', __name__)

@importer_bp.route('/import', methods=['POST'])
@jwt_required()
def import_species():
    print("=== POST /api/import/import called ===")
    try:
        if 'file' not in request.files:
            print("❌ No file provided")
            return jsonify({'msg': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("❌ No file selected")
            return jsonify({'msg': 'Aucun fichier sélectionné'}), 400
        
        print(f"Processing file: {file.filename}")
        
        # Lire le fichier en mémoire
        file_content = file.read()
        file.seek(0)  # Reset le pointeur de fichier
        
        # Déterminer le type de fichier et le lire
        filename = file.filename.lower()
        
        try:
            if filename.endswith('.xlsx') or filename.endswith('.xls'):
                print("Reading Excel file...")
                df = pd.read_excel(io.BytesIO(file_content))
            elif filename.endswith('.csv'):
                print("Reading CSV file...")
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                print(f"❌ Unsupported file format: {filename}")
                return jsonify({'msg': 'Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv'}), 400
                
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            return jsonify({'msg': 'Erreur lors de la lecture du fichier. Vérifiez le format.'}), 400
        
        # Vérifier que le DataFrame n'est pas vide
        if df.empty:
            print("❌ File is empty")
            return jsonify({'msg': 'Le fichier est vide'}), 400
        
        print(f"File contains {len(df)} rows and columns: {list(df.columns)}")
        
        # Normaliser les noms de colonnes
        df.columns = df.columns.str.strip().str.lower()
        
        # Mapper les noms de colonnes possibles
        column_mapping = {
            'nom commun': 'common_name',
            'nom_commun': 'common_name',
            'nom scientifique': 'scientific_name',
            'nom_scientifique': 'scientific_name',
            'description': 'description'
        }
        
        # Appliquer le mapping
        for old_name, new_name in column_mapping.items():
            if old_name in df.columns:
                df = df.rename(columns={old_name: new_name})
                print(f"Mapped column '{old_name}' to '{new_name}'")
        
        print(f"Final columns: {list(df.columns)}")
        
        # Vérifier que les colonnes requises existent
        required_columns = ['common_name', 'scientific_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"❌ Missing columns: {missing_columns}")
            return jsonify({
                'msg': f'Colonnes manquantes: {", ".join(missing_columns)}. Colonnes disponibles: {", ".join(df.columns)}. Colonnes requises: common_name, scientific_name'
            }), 400
        
        # Obtenir l'identité de l'utilisateur
        user_id_str = get_jwt_identity()  # Maintenant c'est un string
        user_id = int(user_id_str)  # Convertir en entier
        print(f"User ID: {user_id}")
        
        created_species = []
        skipped_species = []
        
        for index, row in df.iterrows():
            try:
                # Vérifier que les champs requis ne sont pas vides
                common_name = str(row['common_name']).strip() if pd.notna(row['common_name']) else ''
                scientific_name = str(row['scientific_name']).strip() if pd.notna(row['scientific_name']) else ''
                
                if not common_name or not scientific_name or common_name == 'nan' or scientific_name == 'nan':
                    skipped_species.append(f"Ligne {index + 2}: nom commun ou scientifique manquant")
                    continue
                
                # Vérifier si l'espèce existe déjà
                existing_species = Species.query.filter_by(
                    scientific_name=scientific_name
                ).first()
                
                if existing_species:
                    skipped_species.append(f"{scientific_name} (existe déjà)")
                    continue
                
                # Créer la nouvelle espèce
                description = str(row.get('description', '')).strip() if pd.notna(row.get('description')) else ''
                if description == 'nan':
                    description = ''
                
                species = Species(
                    common_name=common_name,
                    scientific_name=scientific_name,
                    description=description,
                    created_by=user_id
                )
                
                db.session.add(species)
                created_species.append(common_name)
                print(f"Added species: {common_name} ({scientific_name})")
                
            except Exception as e:
                print(f"❌ Error processing row {index}: {e}")
                skipped_species.append(f"Ligne {index + 2}: erreur de traitement - {str(e)}")
                continue
        
        # Sauvegarder toutes les espèces en une seule transaction
        if created_species:
            db.session.commit()
            print(f"✅ Committed {len(created_species)} species to database")
        
        return jsonify({
            'msg': 'Import terminé avec succès',
            'count': len(created_species),
            'created': created_species,
            'skipped': len(skipped_species),
            'skipped_details': skipped_species[:10] if skipped_species else []
        }), 201
        
    except Exception as e:
        print(f"❌ Error in import_species: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'msg': f'Erreur lors de l\'import: {str(e)}'}), 500
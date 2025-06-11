from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import ConservationPlan
from datetime import datetime
import pandas as pd
import io

conservation_bp = Blueprint('conservation', __name__)

@conservation_bp.route('', methods=['GET'])
@jwt_required()
def list_conservation_plans():
    """Récupérer tous les plans de conservation"""
    try:
        plans = ConservationPlan.query.all()
        return jsonify([plan.to_dict() for plan in plans]), 200
    except Exception as e:
        print(f"Error in list_conservation_plans: {e}")
        return jsonify({'msg': 'Erreur lors de la récupération des plans'}), 500

@conservation_bp.route('', methods=['POST'])
@jwt_required()
def create_conservation_plan():
    """Créer un nouveau plan de conservation"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'msg': 'Aucune donnée fournie'}), 400
        
        # Validation des champs requis
        required_fields = ['espece', 'nom_scientifique', 'activite', 'taches', 'responsable', 
                          'date_debut_taches', 'date_fin_taches']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'msg': f'Champ requis manquant: {field}'}), 400
        
        # Conversion des dates
        try:
            date_debut = datetime.strptime(data['date_debut_taches'], '%Y-%m-%d').date()
            date_fin = datetime.strptime(data['date_fin_taches'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'msg': 'Format de date invalide (YYYY-MM-DD)'}), 400
        
        if date_debut >= date_fin:
            return jsonify({'msg': 'La date de début doit être antérieure à la date de fin'}), 400
        
        user_id = int(get_jwt_identity())
        
        plan = ConservationPlan(
            espece=data['espece'].strip(),
            nom_scientifique=data['nom_scientifique'].strip(),
            activite=data['activite'].strip(),
            sous_activite=data.get('sous_activite', '').strip(),
            taches=data['taches'].strip(),
            responsable=data['responsable'].strip(),
            date_debut_taches=date_debut,
            date_fin_taches=date_fin,
            budget_annee_1=float(data.get('budget_annee_1', 0)),
            budget_annee_2=float(data.get('budget_annee_2', 0)),
            budget_annee_3=float(data.get('budget_annee_3', 0)),
            budget_annee_4=float(data.get('budget_annee_4', 0)),
            budget_annee_5=float(data.get('budget_annee_5', 0)),
            created_by=user_id
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'id': plan.id,
            'msg': 'Plan de conservation créé avec succès'
        }), 201
        
    except Exception as e:
        print(f"Error in create_conservation_plan: {e}")
        db.session.rollback()
        return jsonify({'msg': 'Erreur lors de la création du plan'}), 500

@conservation_bp.route('/import', methods=['POST'])
@jwt_required()
def import_conservation_plans():
    """Importer des plans de conservation depuis Excel"""
    try:
        if 'file' not in request.files:
            return jsonify({'msg': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'msg': 'Aucun fichier sélectionné'}), 400
        
        # Lire le fichier
        file_content = file.read()
        filename = file.filename.lower()
        
        try:
            if filename.endswith('.xlsx') or filename.endswith('.xls'):
                df = pd.read_excel(io.BytesIO(file_content))
            elif filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                return jsonify({'msg': 'Format de fichier non supporté'}), 400
        except Exception as e:
            return jsonify({'msg': 'Erreur lors de la lecture du fichier'}), 400
        
        if df.empty:
            return jsonify({'msg': 'Le fichier est vide'}), 400
        
        # Normaliser les colonnes
        df.columns = df.columns.str.strip()
        
        # Mapping des colonnes
        column_mapping = {
            'Espèce': 'espece',
            'Nom scientifique': 'nom_scientifique',
            'Activité': 'activite',
            'Sous-activité': 'sous_activite',
            'Tâches': 'taches',
            'Responsable': 'responsable',
            'date debut taches': 'date_debut_taches',
            'date fin taches': 'date_fin_taches',
            'Budget Année 1': 'budget_annee_1',
            'Budget Année 2': 'budget_annee_2',
            'Budget Année 3': 'budget_annee_3',
            'Budget Année 4': 'budget_annee_4',
            'Budget Année 5': 'budget_annee_5'
        }
        
        # Appliquer le mapping
        for old_name, new_name in column_mapping.items():
            if old_name in df.columns:
                df = df.rename(columns={old_name: new_name})
        
        # Vérifier les colonnes requises
        required_columns = ['espece', 'nom_scientifique', 'activite', 'taches', 
                           'responsable', 'date_debut_taches', 'date_fin_taches']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({
                'msg': f'Colonnes manquantes: {", ".join(missing_columns)}'
            }), 400
        
        user_id = int(get_jwt_identity())
        created_plans = []
        skipped_plans = []
        
        for index, row in df.iterrows():
            try:
                # Vérifier les champs requis
                espece = str(row['espece']).strip() if pd.notna(row['espece']) else ''
                nom_scientifique = str(row['nom_scientifique']).strip() if pd.notna(row['nom_scientifique']) else ''
                
                if not espece or not nom_scientifique:
                    skipped_plans.append(f"Ligne {index + 2}: espèce ou nom scientifique manquant")
                    continue
                
                # Traitement des dates
                try:
                    if pd.notna(row['date_debut_taches']):
                        if isinstance(row['date_debut_taches'], str):
                            date_debut = datetime.strptime(row['date_debut_taches'], '%Y-%m-%d').date()
                        else:
                            date_debut = row['date_debut_taches'].date()
                    else:
                        raise ValueError("Date début manquante")
                    
                    if pd.notna(row['date_fin_taches']):
                        if isinstance(row['date_fin_taches'], str):
                            date_fin = datetime.strptime(row['date_fin_taches'], '%Y-%m-%d').date()
                        else:
                            date_fin = row['date_fin_taches'].date()
                    else:
                        raise ValueError("Date fin manquante")
                except Exception:
                    skipped_plans.append(f"Ligne {index + 2}: dates invalides")
                    continue
                
                # Créer le plan
                plan = ConservationPlan(
                    espece=espece,
                    nom_scientifique=nom_scientifique,
                    activite=str(row.get('activite', '')).strip(),
                    sous_activite=str(row.get('sous_activite', '')).strip(),
                    taches=str(row.get('taches', '')).strip(),
                    responsable=str(row.get('responsable', '')).strip(),
                    date_debut_taches=date_debut,
                    date_fin_taches=date_fin,
                    budget_annee_1=float(row.get('budget_annee_1', 0) or 0),
                    budget_annee_2=float(row.get('budget_annee_2', 0) or 0),
                    budget_annee_3=float(row.get('budget_annee_3', 0) or 0),
                    budget_annee_4=float(row.get('budget_annee_4', 0) or 0),
                    budget_annee_5=float(row.get('budget_annee_5', 0) or 0),
                    created_by=user_id
                )
                
                db.session.add(plan)
                created_plans.append(espece)
                
            except Exception as e:
                skipped_plans.append(f"Ligne {index + 2}: erreur - {str(e)}")
                continue
        
        if created_plans:
            db.session.commit()
        
        return jsonify({
            'msg': 'Import terminé',
            'count': len(created_plans),
            'created': created_plans,
            'skipped': len(skipped_plans),
            'skipped_details': skipped_plans[:10]
        }), 201
        
    except Exception as e:
        print(f"Error in import_conservation_plans: {e}")
        db.session.rollback()
        return jsonify({'msg': f'Erreur lors de l\'import: {str(e)}'}), 500

@conservation_bp.route('/gantt', methods=['GET'])
@jwt_required()
def get_gantt_data():
    """Récupérer les données pour le diagramme de Gantt"""
    try:
        plans = ConservationPlan.query.all()
        
        gantt_data = []
        for plan in plans:
            gantt_data.append({
                'id': plan.id,
                'name': f"{plan.espece} - {plan.activite}",
                'start': plan.date_debut_taches.isoformat(),
                'end': plan.date_fin_taches.isoformat(),
                'progress': 0,  # À implémenter selon vos besoins
                'dependencies': '',
                'custom_class': f'bar-task-{plan.id}',
                'espece': plan.espece,
                'activite': plan.activite,
                'responsable': plan.responsable,
                'budget_total': plan.budget_total
            })
        
        return jsonify(gantt_data), 200
        
    except Exception as e:
        print(f"Error in get_gantt_data: {e}")
        return jsonify({'msg': 'Erreur lors de la récupération des données Gantt'}), 500

@conservation_bp.route('/rapport', methods=['GET'])
@jwt_required()
def generate_rapport():
    """Générer un rapport de suivi des espèces"""
    try:
        plans = ConservationPlan.query.all()
        
        # Statistiques générales
        total_plans = len(plans)
        total_budget = sum(plan.budget_total for plan in plans)
        especes_uniques = len(set(plan.espece for plan in plans))
        
        # Plans par responsable
        responsables = {}
        for plan in plans:
            if plan.responsable not in responsables:
                responsables[plan.responsable] = []
            responsables[plan.responsable].append(plan.to_dict())
        
        # Budget par année
        budgets_annuels = {
            'annee_1': sum(plan.budget_annee_1 for plan in plans),
            'annee_2': sum(plan.budget_annee_2 for plan in plans),
            'annee_3': sum(plan.budget_annee_3 for plan in plans),
            'annee_4': sum(plan.budget_annee_4 for plan in plans),
            'annee_5': sum(plan.budget_annee_5 for plan in plans)
        }
        
        rapport = {
            'resume': {
                'total_plans': total_plans,
                'total_budget': total_budget,
                'especes_uniques': especes_uniques,
                'date_generation': datetime.now().isoformat()
            },
            'budgets_annuels': budgets_annuels,
            'responsables': responsables,
            'plans': [plan.to_dict() for plan in plans]
        }
        
        return jsonify(rapport), 200
        
    except Exception as e:
        print(f"Error in generate_rapport: {e}")
        return jsonify({'msg': 'Erreur lors de la génération du rapport'}), 500
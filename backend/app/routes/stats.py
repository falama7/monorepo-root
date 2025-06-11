from flask import Blueprint,jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Species,Observation
from sqlalchemy import func

stats_bp=Blueprint('stats',__name__)

@stats_bp.route('/population',methods=['GET'])
@jwt_required()
def pop():
    data=db.session.query(Species.common_name,func.count(Observation.id)).join(Observation).group_by(Species.common_name).all()
    return jsonify([{ 'species':n,'count':c } for n,c in data])

@stats_bp.route('/timeline',methods=['GET'])
@jwt_required()
def timeline():
    data=db.session.query(func.date_trunc('month',Observation.observed_at).label('month'),func.count(Observation.id)).group_by('month').order_by('month').all()
    return jsonify([{ 'month':m.isoformat(),'count':c } for m,c in data])
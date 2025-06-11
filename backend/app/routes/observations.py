from flask import Blueprint,request,jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Observation

obs_bp=Blueprint('obs',__name__)

@obs_bp.route('',methods=['GET'])
@jwt_required()
def get_obs():
    args=request.args
    q=Observation.query
    if args.get('species'): q=q.filter_by(species_id=int(args['species']))
    if args.get('from'): q=q.filter(Observation.observed_at>=args['from'])
    data=q.all()
    return jsonify([{'id':o.id,'species_id':o.species_id,'lat':o.latitude,'lng':o.longitude,'observed_at':o.observed_at.isoformat(),'notes':o.notes} for o in data])

@obs_bp.route('',methods=['POST'])
@jwt_required()
def add_obs():
    d=request.get_json();o=Observation(**d)
    db.session.add(o);db.session.commit();return jsonify(id=o.id),201
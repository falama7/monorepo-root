from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Species(db.Model):
    __tablename__ = 'species'
    id = db.Column(db.Integer, primary_key=True)
    common_name = db.Column(db.String(100))
    scientific_name = db.Column(db.String(120))
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    creator = db.relationship('User')

class ConservationPlan(db.Model):
    __tablename__ = 'conservation_plans'
    id = db.Column(db.Integer, primary_key=True)
    espece = db.Column(db.String(200), nullable=False)
    nom_scientifique = db.Column(db.String(200), nullable=False)
    activite = db.Column(db.String(300), nullable=False)
    sous_activite = db.Column(db.String(300))
    taches = db.Column(db.Text, nullable=False)
    responsable = db.Column(db.String(200), nullable=False)
    date_debut_taches = db.Column(db.Date, nullable=False)
    date_fin_taches = db.Column(db.Date, nullable=False)
    budget_annee_1 = db.Column(db.Float, default=0)
    budget_annee_2 = db.Column(db.Float, default=0)
    budget_annee_3 = db.Column(db.Float, default=0)
    budget_annee_4 = db.Column(db.Float, default=0)
    budget_annee_5 = db.Column(db.Float, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User')
    
    @property
    def budget_total(self):
        return (self.budget_annee_1 + self.budget_annee_2 + self.budget_annee_3 + 
                self.budget_annee_4 + self.budget_annee_5)
    
    @property
    def duree_jours(self):
        return (self.date_fin_taches - self.date_debut_taches).days
    
    def to_dict(self):
        return {
            'id': self.id,
            'espece': self.espece,
            'nom_scientifique': self.nom_scientifique,
            'activite': self.activite,
            'sous_activite': self.sous_activite,
            'taches': self.taches,
            'responsable': self.responsable,
            'date_debut_taches': self.date_debut_taches.isoformat(),
            'date_fin_taches': self.date_fin_taches.isoformat(),
            'budget_annee_1': self.budget_annee_1,
            'budget_annee_2': self.budget_annee_2,
            'budget_annee_3': self.budget_annee_3,
            'budget_annee_4': self.budget_annee_4,
            'budget_annee_5': self.budget_annee_5,
            'budget_total': self.budget_total,
            'duree_jours': self.duree_jours,
            'created_at': self.created_at.isoformat()
        }

class Observation(db.Model):
    __tablename__ = 'observations'
    id = db.Column(db.Integer, primary_key=True)
    species_id = db.Column(db.Integer, db.ForeignKey('species.id'))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    observed_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    species = db.relationship('Species')
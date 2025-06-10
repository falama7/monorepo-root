from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Initialisation des extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    jwt.init_app(app)

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.species import species_bp
    from app.routes.observations import obs_bp
    from app.routes.importer import importer_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(species_bp, url_prefix='/api/species')
    app.register_blueprint(obs_bp, url_prefix='/api/observations')
    app.register_blueprint(importer_bp, url_prefix='/api/species')

    # Création des tables
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
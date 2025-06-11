from flask import Flask, jsonify, request
from flask_cors import CORS
from app import db, jwt
from app.config import Config
import time
import sys

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Activer CORS pour toutes les routes
    CORS(app)
    
    db.init_app(app)
    jwt.init_app(app)
    
    # Route de santé
    @app.route('/')
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "Species Tracker API - Conservation System",
            "version": "2.0.0",
            "features": [
                "Species Management",
                "Observations Tracking", 
                "5-Year Conservation Planning",
                "Gantt Charts",
                "Progress Reports"
            ]
        })
    
    @app.route('/health')
    def health():
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "conservation_system": "active"
        })
    
    # Middleware pour capturer et logger les erreurs
    @app.errorhandler(422)
    def handle_422(e):
        print(f"Error 422: {e}")
        print(f"Request: {request.method} {request.path}")
        print(f"Headers: {dict(request.headers)}")
        print(f"Data: {request.get_data()}")
        return jsonify({'error': 'Unprocessable Entity', 'details': str(e)}), 422
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        print(f"Unhandled exception: {e}")
        print(f"Request: {request.method} {request.path}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
    
    # Enregistrer les blueprints avec gestion d'erreurs
    try:
        from app.routes.auth import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        print("✅ Auth blueprint registered")
    except Exception as e:
        print(f"❌ Error registering auth blueprint: {e}")
    
    try:
        from app.routes.species import species_bp
        app.register_blueprint(species_bp, url_prefix='/api/species')
        print("✅ Species blueprint registered")
    except Exception as e:
        print(f"❌ Error registering species blueprint: {e}")
    
    try:
        from app.routes.observations import obs_bp
        app.register_blueprint(obs_bp, url_prefix='/api/observations')
        print("✅ Observations blueprint registered")
    except Exception as e:
        print(f"❌ Error registering observations blueprint: {e}")
    
    try:
        from app.routes.stats import stats_bp
        app.register_blueprint(stats_bp, url_prefix='/api/stats')
        print("✅ Stats blueprint registered")
    except Exception as e:
        print(f"❌ Error registering stats blueprint: {e}")
    
    try:
        from app.routes.importer import importer_bp
        app.register_blueprint(importer_bp, url_prefix='/api/import')
        print("✅ Importer blueprint registered")
    except ImportError as e:
        print(f"⚠️ Importer blueprint not found: {e}")
    except Exception as e:
        print(f"❌ Error registering importer blueprint: {e}")
    
    # Nouveau blueprint pour la conservation et planification
    try:
        from app.routes.conservation import conservation_bp
        app.register_blueprint(conservation_bp, url_prefix='/api/conservation')
        print("✅ Conservation planning blueprint registered")
    except ImportError as e:
        print(f"⚠️ Conservation blueprint not found: {e}")
    except Exception as e:
        print(f"❌ Error registering conservation blueprint: {e}")
    
    # Retry logic pour la connexion DB
    max_retries = 30
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            with app.app_context():
                db.create_all()
                print("✅ Database tables created successfully!")
                
                # Vérifier les tables créées
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                print(f"📊 Available tables: {', '.join(tables)}")
                
            print("Database connection successful!")
            break
        except Exception as e:
            print(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                print("Max retries reached. Exiting.")
                sys.exit(1)
            time.sleep(retry_delay)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
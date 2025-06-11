from flask import Flask, jsonify
from app import db, jwt
from app.config import Config
import time
import sys

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)
    
    # Route de santé
    @app.route('/')
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "Species Tracker API is running",
            "version": "1.0.0"
        })
    
    @app.route('/health')
    def health():
        return jsonify({
            "status": "healthy",
            "database": "connected"
        })
    
    from app.routes.auth import auth_bp
    from app.routes.species import species_bp
    from app.routes.observations import obs_bp
    from app.routes.stats import stats_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(species_bp, url_prefix='/api/species')
    app.register_blueprint(obs_bp, url_prefix='/api/observations')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    
    # Retry logic pour la connexion DB
    max_retries = 30
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            with app.app_context():
                db.create_all()
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
    app.run(host='0.0.0.0', port=5000)
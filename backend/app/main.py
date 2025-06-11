from flask import Flask
from app import db,jwt
from app.config import Config

def create_app():
    app=Flask(__name__);app.config.from_object(Config)
    db.init_app(app);jwt.init_app(app)
    from app.routes.auth import auth_bp
    from app.routes.species import species_bp
    from app.routes.observations import obs_bp
    from app.routes.stats import stats_bp
    app.register_blueprint(auth_bp,url_prefix='/api/auth')
    app.register_blueprint(species_bp,url_prefix='/api/species')
    app.register_blueprint(obs_bp,url_prefix='/api/observations')
    app.register_blueprint(stats_bp,url_prefix='/api/stats')
    with app.app_context(): db.create_all()
    return app

app=create_app()
if __name__=='__main__': app.run(host='0.0.0.0',port=5000)
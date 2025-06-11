from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Instances partagées
db = SQLAlchemy()
jwt = JWTManager()

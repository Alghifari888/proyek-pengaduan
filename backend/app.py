import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db

# Pindahkan load_dotenv() ke paling atas.
# Ini akan memuat file .env SEBELUM file lain diimpor.
load_dotenv()

# Baru impor 'routes' SETELAH load_dotenv() dipanggil.
from routes import api as api_blueprint

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['ABLY_API_KEY'] = os.getenv('ABLY_API_KEY')
    
    CORS(app)
    db.init_app(app)

    app.register_blueprint(api_blueprint, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app
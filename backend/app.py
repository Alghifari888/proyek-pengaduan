import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Inisialisasi library di luar fungsi agar bisa diimpor oleh file lain
# seperti routes.py
bcrypt = Bcrypt()
jwt = JWTManager()

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Konfigurasi dari .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['ABLY_API_KEY'] = os.getenv('ABLY_API_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'kunci-rahasia-super-aman-default')
    
    CORS(app)
    
    # Hubungkan library dengan aplikasi Flask
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # --- PERBAIKAN UTAMA ADA DI SINI ---
    # Impor dan daftarkan blueprint di dalam fungsi ini.
    # Ini akan menunda impor 'routes' sampai setelah semua variabel 
    # (seperti 'bcrypt') sudah siap, sehingga memutus lingkaran impor.
    from routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # Buat semua tabel (termasuk tabel 'user' yang baru)
    with app.app_context():
        db.create_all()

    return app

import os
import asyncio
from flask import Blueprint, request, jsonify
from ably import AblyRest
# Impor model User yang baru
from models import db, Laporan, User 
# Impor bcrypt dari app.py yang akan kita buat
from app import bcrypt 
# Impor fungsi-fungsi dari flask-jwt-extended
from flask_jwt_extended import create_access_token, jwt_required 

# --- Inisialisasi Blueprint & Ably (Tidak Berubah) ---
api = Blueprint('api', __name__)
ably = AblyRest(os.getenv('ABLY_API_KEY'))
laporan_channel = ably.channels.get('laporan-channel')


# =======================================================
#               ROUTE BARU UNTUK OTENTIKASI
# =======================================================

# Endpoint untuk mendaftarkan admin baru (biasanya hanya dijalankan sekali)
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username dan password dibutuhkan"}), 400

    # Cek apakah username sudah ada
    user_exists = User.query.filter_by(username=username).first()
    if user_exists:
        return jsonify({"msg": "Username sudah digunakan"}), 400

    # Hash password menggunakan bcrypt sebelum disimpan ke database
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User admin berhasil dibuat"}), 201

# Endpoint untuk login admin
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    # Cek apakah user ada DAN password yang dimasukkan cocok dengan hash di database
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Jika cocok, buat sebuah "tiket" (access token) JWT
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)

    # Jika tidak cocok, kirim pesan error
    return jsonify({"msg": "Username atau password salah"}), 401


# =======================================================
#       ROUTE-ROUTE LAPORAN (DENGAN PENAMBAHAN KEAMANAN)
# =======================================================

# Endpoint untuk mendapatkan semua laporan (GET) dan membuat laporan baru (POST)
# Route ini tidak perlu diamankan, karena untuk publik
@api.route('/laporan', methods=['GET', 'POST'])
def handle_laporan():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not 'nama_pelapor' in data or not 'isi_laporan' in data or not 'email_pelapor' in data:
            return jsonify({'message': 'Data tidak lengkap!'}), 400
        new_laporan = Laporan(
            nama_pelapor=data['nama_pelapor'],
            email_pelapor=data['email_pelapor'],
            isi_laporan=data['isi_laporan']
        )
        db.session.add(new_laporan)
        db.session.commit()
        try:
            asyncio.run(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))
        except RuntimeError:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))
        return jsonify({'message': 'Laporan berhasil dibuat!', 'laporan': new_laporan.to_dict()}), 201
    else: # GET
        semua_laporan = Laporan.query.order_by(Laporan.tanggal_laporan.desc()).all()
        result = [laporan.to_dict() for laporan in semua_laporan]
        return jsonify(result), 200

# Endpoint untuk mengubah status laporan
# PERUBAHAN: Tambahkan decorator @jwt_required() untuk mengamankan route ini
@api.route('/laporan/<int:laporan_id>/status', methods=['PUT'])
@jwt_required()
def update_laporan_status(laporan_id):
    laporan = db.session.get(Laporan, laporan_id)
    if not laporan:
        return jsonify({'message': 'Laporan tidak ditemukan!'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'message': 'Status baru tidak disediakan!'}), 400
    
    laporan.status = data['status']
    db.session.commit()
    
    try:
        asyncio.run(laporan_channel.publish('laporan-diperbarui', laporan.to_dict()))
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(laporan_channel.publish('laporan-diperbarui', laporan.to_dict()))
        
    return jsonify({'message': 'Status laporan berhasil diperbarui!', 'laporan': laporan.to_dict()})

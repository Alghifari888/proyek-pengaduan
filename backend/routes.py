import os
import asyncio  # <-- TAMBAHKAN IMPORT INI
from flask import Blueprint, request, jsonify
from ably import AblyRest
from models import db, Laporan

# Membuat Blueprint.
api = Blueprint('api', __name__)

# Inisialisasi Ably Client
ably = AblyRest(os.getenv('ABLY_API_KEY'))
laporan_channel = ably.channels.get('laporan-channel')


# Endpoint tetap menggunakan 'def' biasa (sinkron)
@api.route('/laporan', methods=['GET', 'POST'])
def handle_laporan():
    
    # === Logika untuk MEMBUAT laporan (method POST) ===
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

        # === SOLUSI FINAL UNTUK ABLY ===
        # Kita menggunakan asyncio.run() untuk menjalankan fungsi async 'publish'
        # dari dalam fungsi 'def' kita yang sinkron.
        try:
            asyncio.run(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))
        except RuntimeError:
            # Ini adalah fallback jika ada event loop yang sudah berjalan (jarang terjadi di Flask sederhana)
            loop = asyncio.get_event_loop()
            loop.run_until_complete(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))

        # Beri respons ke client
        return jsonify({'message': 'Laporan berhasil dibuat!', 'laporan': new_laporan.to_dict()}), 201

    # === Logika untuk MENDAPATKAN SEMUA laporan (method GET) ===
    else: 
        semua_laporan = Laporan.query.order_by(Laporan.tanggal_laporan.desc()).all()
        result = [laporan.to_dict() for laporan in semua_laporan]
        return jsonify(result), 200

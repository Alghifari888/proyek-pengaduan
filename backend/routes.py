import os
import asyncio
from flask import Blueprint, request, jsonify
from ably import AblyRest
from models import db, Laporan

# Membuat Blueprint.
api = Blueprint('api', __name__)

# Inisialisasi Ably Client menggunakan API Key dari file .env
ably = AblyRest(os.getenv('68titg.tZBMiA:XIcq8Lp1Pl0MSFyBwSlqEwHyjgf8nVaetYRwMP5nx_Q'))
# Membuat channel Ably.
laporan_channel = ably.channels.get('laporan-channel')


# Endpoint untuk MEMBUAT laporan baru (POST) dan MENDAPATKAN semua laporan (GET)
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

        # Mengirim notifikasi real-time 'laporan-baru' ke Ably
        try:
            asyncio.run(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))
        except RuntimeError:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(laporan_channel.publish('laporan-baru', new_laporan.to_dict()))

        return jsonify({'message': 'Laporan berhasil dibuat!', 'laporan': new_laporan.to_dict()}), 201

    # === Logika untuk MENDAPATKAN SEMUA laporan (method GET) ===
    else: # request.method == 'GET'
        semua_laporan = Laporan.query.order_by(Laporan.tanggal_laporan.desc()).all()
        result = [laporan.to_dict() for laporan in semua_laporan]
        return jsonify(result), 200


# =======================================================
#   KODE BARU UNTUK FITUR UPDATE STATUS
# =======================================================
# Endpoint untuk MENGUBAH status sebuah laporan berdasarkan ID-nya
@api.route('/laporan/<int:laporan_id>/status', methods=['PUT'])
def update_laporan_status(laporan_id):
    # Cari laporan berdasarkan ID yang diberikan di URL
    laporan = db.session.get(Laporan, laporan_id)
    
    # Jika laporan dengan ID tersebut tidak ada, kirim error 404
    if not laporan:
        return jsonify({'message': 'Laporan tidak ditemukan!'}), 404

    # Ambil data JSON dari request, yang seharusnya berisi status baru
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'message': 'Status baru tidak disediakan!'}), 400

    # Perbarui kolom status pada objek laporan
    laporan.status = data['status']
    # Simpan perubahan ke database
    db.session.commit()

    # Mengirim notifikasi real-time 'laporan-diperbarui' ke Ably
    try:
        asyncio.run(laporan_channel.publish('laporan-diperbarui', laporan.to_dict()))
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(laporan_channel.publish('laporan-diperbarui', laporan.to_dict()))

    # Kirim respons sukses ke client
    return jsonify({'message': 'Status laporan berhasil diperbarui!', 'laporan': laporan.to_dict()})

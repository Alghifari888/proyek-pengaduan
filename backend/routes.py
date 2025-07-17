import os
import asyncio
from flask import Blueprint, request, jsonify
from ably import AblyRest
from models import db, Laporan

api = Blueprint('api', __name__)

# =======================================================
#           INI SATU-SATUNYA CARA YANG BENAR
# =======================================================
# Inisialisasi Ably dengan MENGAMBIL 'ABLY_API_KEY' dari file .env
ably = AblyRest(os.getenv('ABLY_API_KEY'))
# =======================================================

laporan_channel = ably.channels.get('laporan-channel')

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
    else:
        semua_laporan = Laporan.query.order_by(Laporan.tanggal_laporan.desc()).all()
        result = [laporan.to_dict() for laporan in semua_laporan]
        return jsonify(result), 200

@api.route('/laporan/<int:laporan_id>/status', methods=['PUT'])
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

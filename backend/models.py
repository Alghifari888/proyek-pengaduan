from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Inisialisasi SQLAlchemy
db = SQLAlchemy()

# Model untuk tabel Laporan (TIDAK ADA PERUBAHAN)
class Laporan(db.Model):
    __tablename__ = 'laporan'
    
    id = db.Column(db.Integer, primary_key=True)
    nama_pelapor = db.Column(db.String(100), nullable=False)
    email_pelapor = db.Column(db.String(100), nullable=False)
    isi_laporan = db.Column(db.Text, nullable=False)
    tanggal_laporan = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Terkirim')

    def to_dict(self):
        return {
            'id': self.id,
            'nama_pelapor': self.nama_pelapor,
            'email_pelapor': self.email_pelapor,
            'isi_laporan': self.isi_laporan,
            'tanggal_laporan': self.tanggal_laporan.isoformat(),
            'status': self.status
        }

    def __repr__(self):
        return f'<Laporan ID: {self.id}>'

# =======================================================
#               MODEL BARU UNTUK ADMIN
# =======================================================
class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'
from app import create_app

# Membuat aplikasi menggunakan fungsi factory 'create_app'
app = create_app()

# Menjalankan aplikasi
if __name__ == '__main__':
    # debug=True akan membuat server otomatis restart saat ada perubahan kode
    # dan menampilkan pesan error yang lebih detail di browser.
    # Jangan pernah gunakan debug=True di lingkungan produksi!
    app.run(debug=True, port=5000)
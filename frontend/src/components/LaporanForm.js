import React, { useState } from 'react';
import axios from 'axios';

// Ini adalah Functional Component di React
const LaporanForm = () => {
  // 'useState' adalah sebuah 'Hook' di React untuk mengelola state (data) dalam sebuah komponen.
  // 'formData' akan menyimpan semua data dari inputan form.
  // 'setFormData' adalah fungsi untuk memperbarui 'formData'.
  const [formData, setFormData] = useState({
    nama_pelapor: '',
    email_pelapor: '',
    isi_laporan: '',
  });

  // State untuk menampilkan pesan ke pengguna
  const [message, setMessage] = useState('');

  // Fungsi ini akan dipanggil setiap kali ada perubahan pada input form
  const handleChange = (e) => {
    // e.target.name adalah nama dari input (misal: 'nama_pelapor')
    // e.target.value adalah teks yang diketik pengguna
    setFormData({
      ...formData, // Salin semua data lama
      [e.target.name]: e.target.value, // Timpa data yang berubah
    });
  };

  // Fungsi ini akan dipanggil saat tombol "Kirim Laporan" diklik
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh saat form disubmit
    setMessage('Mengirim laporan...'); // Beri tahu pengguna bahwa proses sedang berjalan

    try {
      // Kirim data ke backend menggunakan Axios.
      // URL ini mengarah ke API Flask kita yang berjalan di port 5000.
      const response = await axios.post('http://localhost:5000/api/laporan', formData);
      
      // Jika berhasil, tampilkan pesan sukses dari server
      setMessage(response.data.message);

      // Kosongkan kembali form setelah berhasil
      setFormData({
        nama_pelapor: '',
        email_pelapor: '',
        isi_laporan: '',
      });
    } catch (error) {
      // Jika gagal, tampilkan pesan error
      setMessage('Gagal mengirim laporan. Coba lagi.');
      console.error('Terjadi error:', error);
    }
  };

  // Bagian JSX: Ini adalah sintaks yang terlihat seperti HTML, tapi sebenarnya JavaScript.
  // Ini mendefinisikan apa yang akan ditampilkan oleh komponen di layar.
  return (
    <div className="form-container">
      <h2>Buat Laporan Pengaduan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="nama_pelapor"
            value={formData.nama_pelapor}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Alamat Email</label>
          <input
            type="email"
            name="email_pelapor"
            value={formData.email_pelapor}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Isi Laporan</label>
          <textarea
            name="isi_laporan"
            value={formData.isi_laporan}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Kirim Laporan</button>
      </form>
      {/* Tampilkan pesan jika ada */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

// Ekspor komponen agar bisa digunakan di file lain
export default LaporanForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Ably from 'ably';
// PERUBAHAN: Impor 'useAbly' yang lebih stabil
import { AblyProvider, useAbly } from 'ably/react';
// Impor instance Axios yang sudah dikonfigurasi
import apiClient from '../api/axiosConfig'; 

// =======================================================
//           API KEY ANDA SUDAH SAYA MASUKKAN
// =======================================================
const ablyClient = new Ably.Realtime({ key: '68titg.tZBMiA:XIcq8Lp1Pl0MSFyBwSlqEwHyjgf8nVaetYRwMP5nx_Q' });
// =======================================================


// Komponen untuk tombol aksi (TIDAK ADA PERUBAHAN)
const AksiLaporan = ({ laporan }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      // Menggunakan apiClient yang sudah ada tokennya
      await apiClient.put(`/laporan/${laporan.id}/status`, {
        status: newStatus,
      });
    } catch (error) {
      console.error('Gagal mengubah status:', error);
      if (error.response && error.response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        alert('Gagal mengubah status laporan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aksi-container">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <>
          <button onClick={() => handleStatusChange('Dikerjakan')} disabled={laporan.status === 'Dikerjakan'}>
            Kerjakan
          </button>
          <button onClick={() => handleStatusChange('Selesai')} disabled={laporan.status === 'Selesai'}>
            Selesaikan
          </button>
        </>
      )}
    </div>
  );
};


// Komponen yang menampilkan tabel (LOGIKA BARU YANG LEBIH STABIL)
const LaporanListContent = () => {
  const [laporan, setLaporan] = useState([]);
  // Gunakan hook 'useAbly' untuk mendapatkan akses ke client Ably
  const client = useAbly();

  // Gunakan useEffect untuk mengelola koneksi dan langganan secara manual
  useEffect(() => {
    // Pastikan client sudah siap sebelum digunakan
    if (!client) {
      return;
    }

    const channel = client.channels.get('laporan-channel');

    const onLaporanBaru = (message) => {
      console.log('Ably: Menerima laporan-baru', message.data);
      setLaporan((prevLaporan) => [message.data, ...prevLaporan]);
    };

    const onLaporanDiperbarui = (message) => {
      console.log('Ably: Menerima laporan-diperbarui', message.data);
      setLaporan((prevLaporan) =>
        prevLaporan.map((item) =>
          item.id === message.data.id ? message.data : item
        )
      );
    };

    // Berlangganan ke kedua event
    channel.subscribe('laporan-baru', onLaporanBaru);
    channel.subscribe('laporan-diperbarui', onLaporanDiperbarui);

    // Ambil data awal dari database
    const fetchLaporan = async () => {
      try {
        const response = await apiClient.get('/laporan');
        setLaporan(response.data);
      } catch (error) {
        console.error('Gagal mengambil data laporan:', error);
      }
    };
    fetchLaporan();

    // Fungsi cleanup: Berhenti berlangganan saat komponen hilang
    return () => {
      channel.unsubscribe();
    };
  }, [client]); // Jalankan efek ini hanya jika client berubah

  // Sisa dari komponen ini sama seperti sebelumnya
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Dikerjakan': return 'status-dikerjakan';
      case 'Selesai': return 'status-selesai';
      default: return 'status-terkirim';
    }
  };

  return (
    <div className="laporan-list-container">
      <h2>Daftar Laporan Masuk</h2>
      <p>Laporan baru dan perubahan status akan muncul di sini secara otomatis.</p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Pelapor</th>
              <th>Isi Laporan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {laporan.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.tanggal_laporan)}</td>
                <td>{item.nama_pelapor}</td>
                <td>{item.isi_laporan}</td>
                <td><span className={`status ${getStatusClass(item.status)}`}>{item.status}</span></td>
                <td><AksiLaporan laporan={item} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Komponen pembungkus utama (TIDAK ADA PERUBAHAN)
const LaporanList = () => (
  <AblyProvider client={ablyClient}>
    <LaporanListContent />
  </AblyProvider>
);

export default LaporanList;

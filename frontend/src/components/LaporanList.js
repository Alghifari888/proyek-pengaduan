import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Ably from 'ably';
import { AblyProvider, useChannel } from 'ably/react';

const ablyClient = new Ably.Realtime({ key: 'YOUR_SUBSCRIBE_ONLY_API_KEY' });

// Komponen untuk satu baris aksi (tombol)
const AksiLaporan = ({ laporan, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/laporan/${laporan.id}/status`, {
        status: newStatus,
      });
      // Kita tidak perlu update state di sini, karena Ably akan melakukannya
    } catch (error) {
      console.error('Gagal mengubah status:', error);
      alert('Gagal mengubah status laporan.');
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


// Komponen utama yang menampilkan daftar
const LaporanListContent = () => {
  const [laporan, setLaporan] = useState([]);

  // Fungsi untuk memperbarui satu laporan di dalam state
  const updateLaporanState = (laporanDiperbarui) => {
    setLaporan((prevLaporan) =>
      prevLaporan.map((item) =>
        item.id === laporanDiperbarui.id ? laporanDiperbarui : item
      )
    );
  };

  // Mendengarkan event 'laporan-baru'
  useChannel('laporan-channel', 'laporan-baru', (message) => {
    console.log('Laporan baru diterima:', message.data);
    setLaporan((prevLaporan) => [message.data, ...prevLaporan]);
  });

  // Mendengarkan event 'laporan-diperbarui'
  useChannel('laporan-channel', 'laporan-diperbarui', (message) => {
    console.log('Laporan diperbarui:', message.data);
    updateLaporanState(message.data);
  });

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/laporan');
        setLaporan(response.data);
      } catch (error) {
        console.error('Gagal mengambil data laporan:', error);
      }
    };
    fetchLaporan();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Fungsi untuk memberikan kelas CSS berdasarkan status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Dikerjakan':
        return 'status-dikerjakan';
      case 'Selesai':
        return 'status-selesai';
      default:
        return 'status-terkirim';
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
                <td>
                  <span className={`status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <AksiLaporan laporan={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Komponen pembungkus AblyProvider
const LaporanList = () => (
  <AblyProvider client={ablyClient}>
    <LaporanListContent />
  </AblyProvider>
);

export default LaporanList;
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GantiPasswordPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = '1'; // ganti sesuai session

  useEffect(() => {
    fetch(`http://localhost:3001/api/users/getuser/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((err) => console.error('Gagal fetch user:', err));
  }, []);

  const handlePasswordChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok.' });
      setIsLoading(false);
      return;
    }

    // Simulasi submit
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Password berhasil diperbarui.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsLoading(false);
    }, 1000);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#191c27] to-[#0d0f17] text-white px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-400">
            <Link href="/dashboard" className="flex items-center hover:text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Dashboard
            </Link>
            <span className="mx-3">/</span>
            <span className="text-cyan-400">Profile</span>
          </nav>
          <h1 className="text-3xl font-bold mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Pengaturan Profil
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="bg-[#181b29]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#2c3045] shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <div className="absolute -bottom-1 right-2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center border-4 border-[#181b29]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold">{user?.name || 'Nama Pengguna'}</h2>
              <p className="text-sm text-gray-400 mt-1">{user?.email || 'email@contoh.com'}</p>
              
              <div className="mt-8 w-full">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#23283b] text-cyan-400 border border-cyan-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Ganti Password</span>
                </div>
              </div>
              
              <div className="mt-6 w-full pt-6 border-t border-[#2c3045]">
                <h3 className="text-left text-sm font-medium text-gray-400 mb-3">AKUN ANDA</h3>
                <div className="space-y-2">
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Bergabung sejak</span>
                    <span>12 Jan 2023</span>
                  </div> */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="lg:col-span-2 bg-[#181b29]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#2c3045] shadow-xl">
            <div className="mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Ganti Password
              </h2>
              <p className="text-sm text-gray-400">Perbarui kata sandi akun Anda dengan yang baru</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#23283b] border border-[#2c3045] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Password Baru</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 rounded-xl bg-[#23283b] border border-[#2c3045] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                      placeholder="•••••••• (min. 8 karakter)"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#23283b] border border-[#2c3045] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </div>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
            
            {message && (
              <div className={`mt-6 p-4 rounded-xl ${
                message.type === 'error' 
                  ? 'bg-red-900/30 border border-red-700/50' 
                  : 'bg-green-900/30 border border-green-700/50'
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${
                    message.type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {message.type === 'error' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      message.type === 'error' ? 'text-red-300' : 'text-green-300'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-10 pt-6 border-t border-[#2c3045]">
              <h3 className="text-lg font-semibold mb-3">Tips Password Aman</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Gunkan kombinasi huruf besar, huruf kecil, angka, dan simbol
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Minimal 12 karakter untuk keamanan optimal
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hindari penggunaan informasi pribadi yang mudah ditebak
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
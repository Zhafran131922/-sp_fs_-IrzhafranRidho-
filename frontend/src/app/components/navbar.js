"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // Hapus token
    router.push("/"); 
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow mb-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">Taskify</div>

        {/* Icons */}
        <div className="flex items-center gap-4 relative">
          {/* Notification */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition"
              title="Notifikasi"
            >
              {/* Icon bell */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                  6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
                  6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0
                  11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3 text-sm text-gray-700 z-10">
                <p className="font-semibold mb-2">Notifikasi</p>
                <ul className="space-y-1">
                  <li>Tugas baru ditambahkan</li>
                  <li>Progress tim meningkat</li>
                </ul>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="text-gray-600 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100 transition"
              title="Profil"
            >
              {/* Icon user */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501
                  20.25a8.25 8.25 0 1115.998 0H4.501z"
                />
              </svg>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-3 text-sm text-gray-700 z-10">
                <ul className="space-y-1">
                  <li>
                    <Link href="/profile">
                      <button className="w-full text-left hover:text-blue-600">
                        Profil Saya
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left hover:text-blue-600"
                    >
                      Keluar
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

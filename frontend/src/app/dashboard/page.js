"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithToken } from "../../../lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await fetchWithToken(
          "http://localhost:3001/api/projects/dashboard",
          token
        );
        const allProjects = [
          ...data.ownedProjects.map((p) => ({ 
            ...p, 
            owner: p.owner_id,
            totalMembers: p.members?.length || 0 
          })),
          ...data.joinedProjects.map((p) => ({ 
            ...p, 
            owner: p.owner_id,
            totalMembers: p.members?.length || 0 
          })),
        ];
        setProjects(allProjects);
        setCurrentUserId(data.ownedProjects[0]?.owner_id || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda belum login.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          inviteEmails: members,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat project");
      }

      // Add to projects list
      setProjects((prev) => [{ 
        ...data, 
        totalMembers: members.length + 1,
        owner: currentUserId 
      }, ...prev]);

      // Reset form
      setForm({ name: "", description: "" });
      setMembers([]);
      setMemberInput("");
      setModalOpen(false);
      
      // Show success notification
      setNotification("Project berhasil dibuat!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error:", error.message);
      setError("Gagal membuat project: " + error.message);
    }
  };

  const handleAddMember = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberInput)) {
      setError("Masukkan email yang valid");
      return;
    }

    if (memberInput.trim() !== "" && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput("");
      setError(null);
    } else if (members.includes(memberInput.trim())) {
      setError("Email sudah ditambahkan");
    }
  };

  const handleRemoveMember = (email) => {
    setMembers(members.filter((m) => m !== email));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const myProjects = projects.filter((p) => p.owner === currentUserId);
  const joinedProjects = projects.filter((p) => p.owner !== currentUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191c27] to-[#0d0f17] p-4">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn z-50">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="max-w-6xl mx-auto py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#41CADA] to-[#5de8fa] bg-clip-text text-transparent">
          Taskify
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Buat Project
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#2a3041] p-2 rounded-full focus:outline-none"
            >
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1f2430] rounded-lg shadow-lg py-1 border border-[#2a3041] z-50">
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a3041] hover:text-white"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Ubah Profil
                  </div>
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2a3041] hover:text-white"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6">
        {/* Project Saya */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#e2e8f0] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#41CADA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Project Saya
            </h2>
            <span className="bg-[#41CADA]/20 text-[#41CADA] text-sm font-medium px-3 py-1 rounded-full">
              {myProjects.length} project
            </span>
          </div>
          
          {myProjects.length === 0 ? (
            <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-8 text-center">
              <div className="mx-auto bg-[#2a3041] p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#41CADA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#e2e8f0] mb-2">Belum ada project</h3>
              <p className="text-gray-400 mb-4">Mulai dengan membuat project baru</p>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Buat Project Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-5 hover:border-[#41CADA] transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-[#e2e8f0] group-hover:text-[#41CADA] transition-colors">
                      {project.name}
                    </h3>
                    <span className="bg-[#41CADA]/20 text-[#41CADA] text-xs font-medium px-2 py-1 rounded-full">
                      {project.totalMembers} anggota
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description || "Tidak ada deskripsi"}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, project.totalMembers))].map((_, i) => (
                        <div key={i} className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-8 h-8" />
                      ))}
                      {project.totalMembers > 3 && (
                        <div className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                          +{project.totalMembers - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-[#2a3041] text-[#41CADA] px-2 py-1 rounded-full">
                      Pemilik
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Project yang Diikuti */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#e2e8f0] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#41CADA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Project yang Diikuti
            </h2>
            <span className="bg-[#41CADA]/20 text-[#41CADA] text-sm font-medium px-3 py-1 rounded-full">
              {joinedProjects.length} project
            </span>
          </div>
          
          {joinedProjects.length === 0 ? (
            <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-8 text-center">
              <div className="mx-auto bg-[#2a3041] p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#41CADA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#e2e8f0] mb-2">Belum bergabung di project</h3>
              <p className="text-gray-400 mb-4">Bergabunglah dengan project tim Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {joinedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/nonowner/${project.id}`}
                  className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-5 hover:border-[#41CADA] transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-[#e2e8f0] group-hover:text-[#41CADA] transition-colors">
                      {project.name}
                    </h3>
                    <span className="bg-[#41CADA]/20 text-[#41CADA] text-xs font-medium px-2 py-1 rounded-full">
                      {project.totalMembers} anggota
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description || "Tidak ada deskripsi"}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, project.totalMembers))].map((_, i) => (
                        <div key={i} className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-8 h-8" />
                      ))}
                      {project.totalMembers > 3 && (
                        <div className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                          +{project.totalMembers - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-[#2a3041] text-gray-400 px-2 py-1 rounded-full">
                      Anggota
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Buat Project */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#e2e8f0]">
                Buat Project Baru
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                }}
                className="text-gray-500 hover:text-[#41CADA]"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nama Project*</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                  placeholder="Nama project Anda"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Deskripsi*</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                  placeholder="Deskripsi project"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Undang Anggota (Email)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    className="flex-1 bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                    placeholder="email@contoh.com"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="bg-[#41CADA] text-[#191c27] px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Tambah
                  </button>
                </div>

                {members.length > 0 && (
                  <div className="border border-[#363d52] rounded-xl p-3 max-h-40 overflow-y-auto bg-[#2a3041]">
                    {members.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-[#1f2430] p-3 rounded-lg mb-2 last:mb-0"
                      >
                        <span className="text-sm text-gray-300">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(email)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-[#363d52] rounded-xl text-gray-300 hover:text-[#e2e8f0] hover:bg-[#2a3041] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Buat Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
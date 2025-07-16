"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee: "",
  });
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  // Fetch project detail
  const fetchProjectDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/projects/${id}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Gagal mengambil data project", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetail();
  }, [id]);

  // Fetch project members (without owner)
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/projects/${id}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Gagal mengambil anggota project", err);
    }
  };

  useEffect(() => {
    if (id) fetchMembers();
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:3001/api/projects/task/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          assigned_user_id: parseInt(taskForm.assignee),
        }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan tugas");

      await fetchProjectDetail();
      setTaskForm({ title: "", description: "", assignee: "" });
    } catch (err) {
      console.error("Gagal submit tugas", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus tugas ini?");
    
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/projects/${id}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus tugas");

      await fetchProjectDetail();
    } catch (err) {
      console.error("Gagal menghapus tugas", err);
    }
  };

  const handleDeleteProject = async () => {
    const token = localStorage.getItem("token");
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus project ini? Semua tugas dalam project ini juga akan dihapus.");
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus project");

      router.push("/dashboard");
    } catch (err) {
      console.error("Gagal menghapus project", err);
    } finally {
      setIsDeleting(false);
    }
  };


const handleInvitePeople = async (e) => {
  e.preventDefault();
  setIsInviting(true);
  setInviteError(null);
  setInviteSuccess(null);

  try {
    const token = localStorage.getItem("token");
    // Bersihkan dan validasi email
    const emailsArray = inviteEmails
      .split(",")
      .map(email => email.trim())
      .filter(email => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      });

    if (emailsArray.length === 0) {
      throw new Error("Harap masukkan minimal 1 email yang valid");
    }

    const res = await fetch(
      `http://localhost:3001/api/projects/${id}/invite`, // Pastikan endpoint ini benar
      {
        method: "POST", // Pastikan method sesuai dengan backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviteEmails: emailsArray,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Gagal mengundang anggota");
    }

    setInviteSuccess(`${emailsArray.length} undangan berhasil dikirim`);
    setInviteEmails("");
    await fetchMembers(); // Refresh daftar member
  } catch (err) {
    setInviteError(err.message);
  } finally {
    setIsInviting(false);
  }
};

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#191c27] to-[#0d0f17]">
      <div className="animate-pulse text-center">
        <div className="bg-[#41CADA] h-10 w-10 rounded-full mx-auto mb-4"></div>
        <p className="text-[#41CADA]">Memuat project...</p>
      </div>
    </div>
  );
  
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#191c27] to-[#0d0f17] p-4">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">Project tidak ditemukan</h2>
        <p className="text-gray-400 mb-6">Project yang Anda coba akses tidak tersedia atau telah dihapus</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );

  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t?.status === "DONE").length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const generateKey = (task, index) => {
    return task?.id 
      ? task.id 
      : `${task?.title}_${task?.description}_${index}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#191c27] to-[#0d0f17] p-4">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2430] rounded-2xl border border-[#2a3041] p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#e2e8f0]">Undang Anggota</h2>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError(null);
                  setInviteSuccess(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleInvitePeople} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email (pisahkan dengan koma untuk banyak email)</label>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="user1@example.com, user2@example.com"
                  className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                  rows={3}
                  required
                />
              </div>
              
              {inviteError && (
                <div className="text-red-400 text-sm">{inviteError}</div>
              )}
              
              {inviteSuccess && (
                <div className="text-green-400 text-sm">{inviteSuccess}</div>
              )}
              
              <button
                type="submit"
                disabled={isInviting}
                className="w-full bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isInviting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#191c27] inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengundang...
                  </>
                ) : (
                  "Kirim Undangan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <button
            onClick={() => router.back()}
            className="text-[#41CADA] hover:text-[#5de8fa] flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Undang Anggota
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menghapus...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Hapus Project
                </>
              )}
            </button>
          </div>
        </div>

        {/* Project Header */}
        <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#e2e8f0]">{project.name}</h1>
              <p className="text-gray-400 mt-2">{project.description || "Tidak ada deskripsi"}</p>
            </div>
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member, index) => (
                <div key={index} className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-10 h-10 flex items-center justify-center text-xs text-gray-300">
                  {member.name.charAt(0)}
                </div>
              ))}
              {members.length > 3 && (
                <div className="bg-[#2a3041] border-2 border-[#1f2430] rounded-full w-10 h-10 flex items-center justify-center text-xs text-gray-400">
                  +{members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#e2e8f0]">Progress Tim</h2>
            <span className="bg-[#41CADA]/20 text-[#41CADA] text-sm font-medium px-3 py-1 rounded-full">
              {progressPercent}% selesai
            </span>
          </div>
          
          <div className="w-full bg-[#2a3041] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] h-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {completedTasks} dari {totalTasks} tugas telah selesai
          </p>
        </div>

        {/* Task Form */}
        <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#e2e8f0] mb-4">Tambah Tugas Baru</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Judul Tugas</label>
              <input
                type="text"
                required
                placeholder="Apa yang perlu dikerjakan?"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Deskripsi</label>
              <textarea
                required
                placeholder="Deskripsi tugas..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ditugaskan ke</label>
              <select
                required
                value={taskForm.assignee}
                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white"
              >
                <option value="">Pilih anggota</option>
                {members.map((user, index) => (
                  <option key={user?.id || `member_${index}`} value={user?.id}>
                    {user?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Tambah Tugas
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-[#1f2430] backdrop-blur-sm rounded-2xl border border-[#2a3041] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#e2e8f0]">Daftar Tugas</h2>
            <span className="bg-[#41CADA]/20 text-[#41CADA] text-sm font-medium px-3 py-1 rounded-full">
              {tasks.length} tugas
            </span>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400">Belum ada tugas</h3>
              <p className="text-gray-500">Tambahkan tugas pertama untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div 
                  key={generateKey(task, index)}
                  className="bg-[#2a3041] border border-[#363d52] rounded-xl p-4 hover:border-[#41CADA] transition-all duration-300 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#e2e8f0]">
                        {task?.title || "Untitled Task"}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{task?.description || "No description"}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        task?.status === "TODO"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : task?.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-400"
                          : task?.status === "DONE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {task?.status ? task.status.toLowerCase() : "unknown"}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-[#363d52] flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="block">Ditugaskan ke:</span>
                      <span className="text-[#41CADA]">{task?.assigned_user?.name || "-"}</span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Hapus tugas"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {task?.comment && (
                    <div className="mt-3 p-3 bg-[#1f2430] rounded-lg border border-[#363d52]">
                      <p className="text-sm text-gray-400 italic">Catatan: {task.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
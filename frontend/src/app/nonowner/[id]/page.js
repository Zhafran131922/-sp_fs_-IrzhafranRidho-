'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Gagal decode token:", e);
    return null;
  }
}

export default function NonOwnerProjectDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [notesInput, setNotesInput] = useState({});
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get token and user_id from JWT
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decoded = parseJwt(storedToken);
        setToken(storedToken);
        setCurrentUserId(decoded?.id || null);
      }
    }
  }, []);

  // Fetch project data and tasks
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!token || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/projects/${id}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error("Gagal ambil data project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, token, statusUpdated]);

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/complete/${taskId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: notesInput[taskId] || "" }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan komentar");

      setStatusUpdated(true);
      setTimeout(() => setStatusUpdated(false), 500);
      setNotesInput((prev) => ({ ...prev, [taskId]: "" }));
    } catch (err) {
      console.error("Error submit komentar:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#191c27] to-[#0d0f17]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#41CADA]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#191c27] to-[#0d0f17]">
        <p className="text-gray-400">Gagal memuat data proyek</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#191c27] to-[#0d0f17] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#41CADA] hover:text-[#5de8fa] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
          {statusUpdated && (
            <div className="bg-[#41CADA]/20 text-[#41CADA] px-3 py-1 rounded-full text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Berhasil diperbarui
            </div>
          )}
        </div>

        {/* Project Header */}
        <div className="bg-[#1f2430] rounded-xl p-6 space-y-3 border border-[#2a3041]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#e2e8f0]">{project.name}</h1>
          <p className="text-gray-400">{project.description || 'Tidak ada deskripsi proyek.'}</p>
        </div>

        {/* Tasks Section */}
        <div className="bg-[#1f2430] rounded-xl p-6 space-y-4 border border-[#2a3041]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#e2e8f0]">Daftar Tugas</h2>
            <span className="bg-[#41CADA]/20 text-[#41CADA] text-xs font-medium px-2.5 py-0.5 rounded-full">
              {project.tasks.length} tugas
            </span>
          </div>

          {project.tasks.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-400">Belum ada tugas</h3>
              <p className="mt-1 text-xs text-gray-500">Tambahkan tugas untuk memulai proyek</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {project.tasks.map((task) => {
                const isMyTask = task.assigned_user?.id === currentUserId;
                const isTodo = task.status === 'TODO';
                const isInProgress = task.status === 'ON_PROGRESS';
                const isDone = task.status === 'DONE';

                return (
                  <li key={task.id} className="border rounded-lg p-4 space-y-3 border-[#2a3041] hover:border-[#41CADA] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#e2e8f0]">{task.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        isTodo ? 'bg-yellow-500/20 text-yellow-400' :
                        isInProgress ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {isTodo ? 'Not started yet' : isInProgress ? 'TO DO' : 'Done'}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Ditugaskan ke: <span className="text-[#41CADA] ml-1">{task.assigned_user?.name || "Belum ditentukan"}</span>
                    </div>

                    {/* Comment input for assigned tasks - only show if not DONE */}
                    {isMyTask && !isDone && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          placeholder={
                            isTodo ? "Catatan saat memulai tugas..." :
                            "Update progres tugas..."
                          }
                          className="w-full p-3 text-sm bg-[#2a3041] border border-[#363d52] rounded-lg focus:ring-2 focus:ring-[#41CADA] focus:border-[#41CADA] text-[#e2e8f0] placeholder-gray-500"
                          value={notesInput[task.id] || ""}
                          onChange={(e) => setNotesInput({ ...notesInput, [task.id]: e.target.value })}
                          rows={3}
                        />
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium text-[#191c27] ${
                            isTodo ? 'bg-[#41CADA] hover:bg-[#3ab4c2]' :
                            'bg-[#41CADA] hover:bg-[#3ab4c2]'
                          } transition-colors`}
                        >
                          {isTodo ? 'Mulai Kerjakan' : 'Tandai Selesai'}
                        </button>
                      </div>
                    )}

                    {/* Existing comments */}
                    {task.comment && (
                      <div className="mt-3 p-3 bg-[#2a3041] rounded-lg border border-[#363d52]">
                        <div className="flex items-center text-xs text-gray-400 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Komentar:
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.comment}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
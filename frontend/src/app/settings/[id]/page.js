"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProjectSettings() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch project details and members
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch project details
        const projectRes = await fetch(
          `http://localhost:3001/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const projectData = await projectRes.json();
        setProject(projectData);
        setForm({
          name: projectData.name,
          description: projectData.description,
        });

        // Fetch members
        const membersRes = await fetch(
          `http://localhost:3001/api/projects/${id}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const membersData = await membersRes.json();
        setMembers(membersData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Gagal memuat data project");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleEditProject = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui project");
      }

      setProject(data);
      setEditMode(false);
      setSuccess("Project berhasil diperbarui");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    const confirmRemove = confirm(
      "Apakah Anda yakin ingin menghapus anggota ini dari project?"
    );
    if (!confirmRemove) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3001/api/projects/${id}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Gagal menghapus anggota");
      }

      // Refresh members list
      const membersRes = await fetch(
        `http://localhost:3001/api/projects/${id}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMembers = await membersRes.json();
      setMembers(updatedMembers);
      setSuccess("Anggota berhasil dihapus");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error removing member:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p>Memuat data project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p>Project tidak ditemukan</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali ke Project
        </button>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Pengaturan Project
            </h1>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          {editMode ? (
            <form onSubmit={handleEditProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Project
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      name: project.name,
                      description: project.description,
                    });
                    setError(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {project.name}
                </h2>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Anggota Tim
          </h2>
          {members.length === 0 ? (
            <p className="text-gray-500">Belum ada anggota.</p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Hapus anggota"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
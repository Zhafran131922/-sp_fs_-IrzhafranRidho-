const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const verifyToken = require("../middleware/token");
const { sendInvitationEmail } = require("../utils/sendMail");
const nodemailer = require("nodemailer");

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ✅ POST Create Project
router.post("/", verifyToken, async (req, res) => {
  const { name, description, inviteEmails } = req.body;
  const owner_id = req.user.id;
  const invite_code = generateInviteCode();

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        invite_code,
        owner: {
          connect: { id: owner_id },
        },
      },
    });

    // Tambahkan owner ke projectMembers
    await prisma.projectMember.create({
      data: {
        project: { connect: { id: project.id } },
        user: { connect: { id: owner_id } },
      },
    });

    const invitedEmails = [];

    if (Array.isArray(inviteEmails)) {
      for (const email of inviteEmails) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          invitedEmails.push(email);

          // Simpan di tabel undangan
          await prisma.projectInvite.create({
            data: {
              project: { connect: { id: project.id } },
              invited_user: { connect: { id: user.id } },
            },
          });

          // Tambahkan juga langsung ke member
          await prisma.projectMember.create({
            data: {
              project: { connect: { id: project.id } },
              user: { connect: { id: user.id } },
            },
          });

          // Kirim email
          const inviteLink = `http://localhost:3000/`;
          await sendInvitationEmail({
            to: email,
            projectName: project.name,
            inviteLink,
          });
        }
      }
    }

    res.status(201).json({
      id: project.id,
      name: project.name,
      description: project.description,
      owner_id: project.owner_id,
      invitedEmails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET dashboard berisikan project sendiri dan user lain
router.get("/dashboard", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const ownedProjects = await prisma.project.findMany({
      where: { owner_id: userId },
      include: {
        members: {
          select: { user_id: true },
        },
      },
    });

    const joinedProjectMembers = await prisma.projectMember.findMany({
      where: {
        user_id: userId,
        project: {
          NOT: { owner_id: userId },
        },
      },
      include: { project: true },
    });

    const joinedProjects = joinedProjectMembers.map((pm) => pm.project);

    res.json({
      ownedProjects,
      joinedProjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Buat task untuk anggota
router.post("/task/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigned_user_id } = req.body;
  const owner_id = req.user.id;

  try {
    // 🔐 Cek apakah user yang login adalah pemilik project
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project || project.owner_id !== owner_id) {
      return res.status(403).json({
        error: "You are not authorized to assign tasks in this project.",
      });
    }

    // 🔍 Cek apakah assigned_user adalah anggota project
    const memberCheck = await prisma.projectMember.findFirst({
      where: {
        project_id: parseInt(projectId),
        user_id: assigned_user_id,
      },
    });

    if (!memberCheck) {
      return res
        .status(400)
        .json({ error: "The user is not a member of this project." });
    }

    // 📝 Buat task baru
    const task = await prisma.task.create({
      data: {
        title,
        description,
        project_id: parseInt(projectId),
        assigned_user_id,
      },
    });

    res.status(201).json({
      message: "Task assigned successfully.",
      task,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get project
// router.get('/:projectId', verifyToken, async (req, res) => {
//   const { projectId } = req.params;

//   try {
//     const project = await prisma.project.findUnique({
//       where: { id: Number(projectId) },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//       },
//     });

//     if (!project) {
//       return res.status(404).json({ error: 'Project tidak ditemukan' });
//     }

//     res.json(project);
//   } catch (err) {
//     console.error('Gagal mengambil project:', err);
//     res.status(500).json({ error: 'Gagal mengambil data project' });
//   }
// });

// ✅ GET assigned tasks
router.get("/assigned", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assigned_user_id: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Buat dua grup: ON_PROGRESS dan DONE
    const onProgressTasks = tasks.filter(
      (task) => task.status === "ON_PROGRESS"
    );
    const doneTasks = tasks
      .filter((task) => task.status === "DONE")
      .map((task) => ({
        ...task,
        comment: task.comment,
        completedAt: task.updatedAt,
      }));

    res.json({
      onProgress: onProgressTasks,
      done: doneTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Selesaikan tugas
router.post("/complete/:taskId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { taskId } = req.params;
  const { comment } = req.body;

  try {
    // Cek apakah tugas dimiliki oleh user
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task || task.assigned_user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized or task not found" });
    }

    // Update status dan tambahkan komentar
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: {
        status: "DONE",
        comment: comment,
      },
    });

    res.json({ message: "Task completed", task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Invite anggota
router.post("/:projectId/invite", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { inviteEmails } = req.body;
  const ownerId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project || project.owner_id !== ownerId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const invited = [];

    for (const email of inviteEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Cek apakah sudah member dulu
        const alreadyMember = await prisma.projectMember.findFirst({
          where: {
            project_id: project.id,
            user_id: user.id,
          },
        });

        if (!alreadyMember) {
          // Tambahkan ke undangan
          await prisma.projectInvite.create({
            data: {
              project_id: project.id,
              invited_user_id: user.id,
            },
          });

          // Tambahkan juga ke anggota project
          await prisma.projectMember.create({
            data: {
              project_id: project.id,
              user_id: user.id,
            },
          });

          // Kirim email undangan
          const inviteLink = `http://localhost:3000/project/${project.id}`;
          await sendInvitationEmail({
            to: email,
            projectName: project.name,
            inviteLink,
          });

          invited.push(email);
        }
      }
    }

    res.json({ message: "Members invited via email", invited });
  } catch (err) {
    console.error("Error inviting:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete member
router.delete("/:projectId/members/:userId", verifyToken, async (req, res) => {
  const { projectId, userId } = req.params;
  const ownerId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project || project.owner_id !== ownerId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (parseInt(userId) === ownerId) {
      return res.status(400).json({ error: "Owner cannot remove themselves" });
    }

    // Hapus user dari anggota project
    await prisma.projectMember.deleteMany({
      where: {
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
      },
    });

    // Opsional: hapus juga dari daftar undangan
    await prisma.projectInvite.deleteMany({
      where: {
        project_id: parseInt(projectId),
        invited_user_id: parseInt(userId),
      },
    });

    res.json({ message: "User removed from project" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// ✅ Delete project
router.delete("/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user.id;

  try {
    // Pastikan user adalah owner dari project
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner_id !== ownerId) {
      return res.status(403).json({ error: "Unauthorized: Not project owner" });
    }

    // Hapus dependensi terlebih dahulu (jika foreign key constraints)
    await prisma.projectInvite.deleteMany({
      where: { project_id: parseInt(projectId) },
    });

    await prisma.projectMember.deleteMany({
      where: { project_id: parseInt(projectId) },
    });

    await prisma.task.deleteMany({
      where: { project_id: parseInt(projectId) },
    });

    // Hapus project
    await prisma.project.delete({
      where: { id: parseInt(projectId) },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/projects.js
router.get("/:projectId/tasks", verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: {
        name: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            comment: true,
            assigned_user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project tidak ditemukan." });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:projectId/members", verifyToken, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const userId = req.user.id; // didapat dari token

  try {
    // Cari proyek berdasarkan ID dan pastikan user adalah owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        owner: {
          select: { id: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.id !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied. Only the owner can view members." });
    }

    const membersExcludingOwner = project.members.filter(
      (member) => member.user.id !== project.owner.id
    );

    const result = membersExcludingOwner.map((member) => member.user);

    res.json(result);
  } catch (err) {
    console.error("Error getting members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Cek apakah user adalah owner
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return res.status(404).json({ error: "Project tidak ditemukan." });
    }

    if (project.owner_id !== userId) {
      return res
        .status(403)
        .json({ error: "Akses ditolak. Bukan pemilik project." });
    }

    // Hapus project (otomatis menghapus relasi jika sudah diatur cascading di schema Prisma)
    await prisma.project.delete({
      where: { id: parseInt(projectId) },
    });

    res.json({ message: "Project berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus project." });
  }
});

// edit title project
router.put("/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return res.status(404).json({ error: "Project tidak ditemukan." });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({ error: "Anda bukan pemilik project ini." });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        name: name || project.name,
        description: description || project.description,
      },
    });

    res.json(updatedProject);
  } catch (err) {
    console.error("Gagal mengedit project:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat mengedit project." });
  }
});

router.delete("/:projectId/tasks/:taskId", verifyToken, async (req, res) => {
  const { projectId, taskId } = req.params;
  const userId = req.user.id;

  try {
    // Cek apakah user adalah owner dari project tersebut
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return res.status(404).json({ error: "Project tidak ditemukan." });
    }

    if (project.owner_id !== userId) {
      return res
        .status(403)
        .json({ error: "Akses ditolak. Bukan pemilik project." });
    }

    // Cek apakah task memang bagian dari project ini
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task || task.project_id !== parseInt(projectId)) {
      return res
        .status(404)
        .json({ error: "Task tidak ditemukan di project ini." });
    }

    // Hapus task
    await prisma.task.delete({
      where: { id: parseInt(taskId) },
    });

    res.json({ message: "Tugas berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus tugas." });
  }
});

module.exports = router;

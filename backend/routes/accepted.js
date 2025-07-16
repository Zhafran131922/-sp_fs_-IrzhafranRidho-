const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const verifyToken = require("../middleware/token");

router.post("/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const { accept } = req.body; // ambil boolean true/false dari JSON

  try {
    const invite = await prisma.projectInvite.findFirst({
      where: {
        invited_user_id: userId,
        project_id: parseInt(projectId),
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Invitation not found." });
    }

    if (accept === true) {
      // Tambahkan user ke anggota project
      await prisma.projectMember.create({
        data: {
          user_id: userId,
          project_id: parseInt(projectId),
        },
      });
    }

    // Hapus undangan (dalam kedua kasus)
    await prisma.projectInvite.deleteMany({
      where: {
        invited_user_id: userId,
        project_id: parseInt(projectId),
      },
    });

    res.json({
      message: accept
        ? "Invitation accepted and user added to project."
        : "Invitation declined and removed.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

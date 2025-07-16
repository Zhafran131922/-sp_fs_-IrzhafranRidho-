const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const invites = await prisma.projectInvite.findMany({
      where: {
        invited_user_id: parseInt(userId),
      },
      include: {
        project: {
          include: {
            owner: true, 
          },
        },
      },
    });

    const result = invites.map((invite) => ({
      project_id: invite.project.id,
      name: invite.project.name,
      description: invite.project.description,
      owner_id: invite.project.owner_id,
      owner_name: invite.project.owner?.name || "Unknown", // ⬅️ Ambil nama owner
    }));

    res.json({ invitations: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

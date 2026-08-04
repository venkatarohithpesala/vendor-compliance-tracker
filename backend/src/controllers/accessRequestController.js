import AccessRequest from "../models/AccessRequest.js";

// POST /api/access-requests  — public, no auth needed
export const createAccessRequest = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }

  try {
    const request = await AccessRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Access request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error("Create access request error:", error);
    return res.status(500).json({ message: "Failed to submit access request.", error: error.message });
  }
};

// GET /api/access-requests  — protected (super_admin / admin)
export const getAccessRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Get access requests error:", error);
    return res.status(500).json({ message: "Failed to fetch access requests.", error: error.message });
  }
};

// PUT /api/access-requests/:id/status  — protected (super_admin / admin)
export const updateAccessRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "reviewed", "approved", "rejected"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
  }

  try {
    const request = await AccessRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Access request not found." });
    }

    await request.update({
      status,
      reviewedBy: req.user?.email ?? null,
      reviewedAt: new Date(),
    });

    return res.status(200).json({ message: "Status updated.", request });
  } catch (error) {
    console.error("Update access request status error:", error);
    return res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
};

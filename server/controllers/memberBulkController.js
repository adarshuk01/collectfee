// controllers/memberBulk.controller.js
const XLSX = require("xlsx");
// controllers/memberBulk.controller.js
const Member = require("../models/Member");

exports.previewMembersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false
    });

    // validate & map
    const members = rows
      .filter(r => r.fullName && r.contactNumber)
      .map(r => ({
        fullName: r.fullName.trim(),
        contactNumber: String(r.contactNumber).trim(),
        email: r.email?.trim() || "",
        address: r.address?.trim() || ""
      }));

    res.json({
      count: members.length,
      members
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkAddMembers = async (req, res) => {
  try {
    const clientId = req.user.id;
    const members = req.body.members;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members array required"
      });
    }

    // ✅ Get existing members for this client
    const existingMembers = await Member.find(
      { clientId },
      { email: 1, contactNumber: 1 }
    );

    // ✅ Build lookup sets
    const existingEmails = new Set(
      existingMembers
        .filter(m => m.email)
        .map(m => m.email.toLowerCase())
    );

    const existingPhones = new Set(
      existingMembers
        .filter(m => m.contactNumber)
        .map(m => m.contactNumber)
    );

    const payload = [];
    let skipped = 0;

    for (const m of members) {
      const email = m.email?.toLowerCase();
      const phone = m.contactNumber;

      // ✅ Skip if email OR phone exists under same client
      if (
        (email && existingEmails.has(email)) ||
        (phone && existingPhones.has(phone))
      ) {
        skipped++;
        continue;
      }

      // ✅ Add to payload
      payload.push({
        ...m,
        email,
        clientId
      });

      // ✅ Update sets to avoid duplicates inside same Excel
      if (email) existingEmails.add(email);
      if (phone) existingPhones.add(phone);
    }

    if (!payload.length) {
      return res.status(400).json({
        success: false,
        message: "All members already exist",
        skipped
      });
    }

    await Member.insertMany(payload, { ordered: false });

    res.json({
      success: true,
      inserted: payload.length,
      skipped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const Attendance = require("../models/Attendance");
const Member = require("../models/Member");


exports.markAttendance = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { date, records } = req.body;

    /**
     * records = [
     *   { memberId, status }
     * ]
     */

    if (!date || !records?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { member: r.memberId, date },
        update: {
          $set: {
            client: clientId,
            member: r.memberId,
            date,
            status: r.status,
            markedBy: clientId,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance failed" });
  }
};


exports.getAttendanceByDate = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { date } = req.params;

    const data = await Attendance.find({ client: clientId, date })
      .populate("member", "name rollNo")
      .lean();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};


exports.getMemberAttendance = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { memberId } = req.params;

    const data = await Attendance.find({
      client: clientId,
      member: memberId,
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch member attendance" });
  }
};

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { month } = req.query; // YYYY-MM

    const data = await Attendance.find({
      client: clientId,
      date: { $regex: `^${month}` },
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly report" });
  }
};

exports.getAttendanceByBatchAndDate = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { batchId, date } = req.query;

    if (!batchId || !date) {
      return res
        .status(400)
        .json({ message: "batchId and date are required" });
    }

    // 1️⃣ Get all members of the batch (ALPHABETICAL ORDER)
    const members = await Member.find({
      clientId: clientId,
      batchId: batchId,
    })
      .sort({ fullName: 1 })
.collation({ locale: "en", strength: 2 })
      .lean();

    // 2️⃣ Get attendance for that date
    const attendance = await Attendance.find({
      client: clientId,
      date,
      member: { $in: members.map((m) => m._id) },
    }).lean();

    // 3️⃣ Map attendance by memberId
    const attendanceMap = {};
    attendance.forEach((a) => {
      attendanceMap[a.member.toString()] = a.status;
    });

    // 4️⃣ Merge members + attendance
    const result = members.map((m) => ({
      ...m,
      status: attendanceMap[m._id.toString()] || "present",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};




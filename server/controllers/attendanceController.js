const Attendance = require("../models/Attendance");
const QRSession = require("../models/QRSession");

exports.markAttendance = async (req, res) => {
  const { qrId } = req.body;

  const session = await QRSession.findById(qrId);
  if (!session || session.expiresAt < new Date())
    return res.status(400).json({ msg: "QR expired" });

  await Attendance.create({
    studentId: req.user.id,
    className: session.className
  });

  res.json({ msg: "Attendance marked" });
};

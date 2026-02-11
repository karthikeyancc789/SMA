const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  className: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", attendanceSchema);

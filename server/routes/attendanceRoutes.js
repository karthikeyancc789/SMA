const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { markAttendance } = require("../controllers/attendanceController");

router.post("/mark", auth, markAttendance);

module.exports = router;

const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { QRGenerate } = require("../controllers/qrController");

router.post("/generate", auth, QRGenerate);

module.exports = router;

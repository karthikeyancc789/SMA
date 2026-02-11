const QRSession = require("../models/QRSession");
const QRCode = require("qrcode");

exports.QRGenerate = async (req, res) => {
  const { className } = req.body;

  const session = await QRSession.create({
    className,
    expiresAt: new Date(Date.now() + 5 * 60000)
  });

  const qrData = JSON.stringify({ id: session._id });
  const qrImage = await QRCode.toDataURL(qrData);

  res.json({ qrImage });
};

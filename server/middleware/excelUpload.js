// middleware/excelUpload.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xls|xlsx)$/)) {
      cb(new Error("Only Excel files allowed"));
    }
    cb(null, true);
  }
});

module.exports = upload;

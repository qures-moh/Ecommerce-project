const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|webp/;

  const extension =
    allowedTypes.test(
      path
        .extname(file.originalname)
        .toLowerCase()
    );

  const mimetype =
    allowedTypes.test(file.mimetype);

  if (extension && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only jpg, jpeg, png and webp images are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 50,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
const express = require("express");

const {
  getTags,
  createTag,
  toggleTagStatus,
  deleteTag,
} = require("../controller/tagController");

const adminMiddleware = require("../middleware/admin");

const router = express.Router();

router.get("/", getTags);

router.post(
  "/",
  adminMiddleware,
  createTag
);

router.patch(
  "/:id/status",
  adminMiddleware,
  toggleTagStatus
);

router.delete(
  "/:id",
  adminMiddleware,
  deleteTag
);

module.exports = router;
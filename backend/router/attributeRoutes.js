const express = require("express");

const {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
} = require("../controller/attributeController");

const adminMiddleware = require("../middleware/admin");

const router = express.Router();

router.get("/", getAttributes);

router.get("/:id", getAttributeById);

router.post("/", adminMiddleware, createAttribute);

router.put("/:id", adminMiddleware, updateAttribute);

router.delete("/:id", adminMiddleware, deleteAttribute);

router.post("/:id/values", adminMiddleware, addAttributeValue);

router.put("/:id/values/:valueId", adminMiddleware, updateAttributeValue);

router.delete("/:id/values/:valueId", adminMiddleware, deleteAttributeValue);

module.exports = router;
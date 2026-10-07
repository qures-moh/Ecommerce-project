const Tag = require("../model/Tag");

const getTags = async (req, res) => {
  try {
    const { search = "", limit = 50 } = req.query;

    const limitNumber = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const query = {};

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.name = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    const tags = await Tag.find(query)
      .select("_id name isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .lean();

    return res.status(200).json({
      message: "Tags fetched successfully",
      tags,
    });
  } catch (error) {
    console.error("GET TAGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch tags",
      error: error.message,
    });
  }
};

const createTag = async (req, res) => {
  try {
    const name = String(req.body.name || "")
      .trim()
      .toLowerCase();

    if (!name) {
      return res.status(400).json({
        message: "Tag name is required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: "Tag must contain at least 2 characters",
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        message: "Tag cannot exceed 50 characters",
      });
    }

    const existingTag = await Tag.findOne({ name });

    if (existingTag) {
      return res.status(409).json({
        message: existingTag.isActive
          ? "Tag already exists"
          : "Tag already exists but is inactive. Activate it instead.",
        tag: existingTag,
      });
    }

    const tag = await Tag.create({
      name,
      isActive: true,
    });

    return res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    console.error("CREATE TAG ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Tag already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create tag",
      error: error.message,
    });
  }
};

const toggleTagStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    tag.isActive = !tag.isActive;

    await tag.save();

    return res.status(200).json({
      message: tag.isActive
        ? "Tag activated successfully"
        : "Tag deactivated successfully",
      tag,
    });
  } catch (error) {
    console.error("TOGGLE TAG STATUS ERROR:", error);

    return res.status(500).json({
      message: "Failed to update tag status",
      error: error.message,
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    await Tag.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TAG ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete tag",
      error: error.message,
    });
  }
};

module.exports = {
  getTags,
  createTag,
  toggleTagStatus,
  deleteTag,
};
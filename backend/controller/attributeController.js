const Attribute = require("../model/Attribute");

const getAttributes = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const filter = {
      isActive: true,
    };

    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const attributes = await Attribute.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Attributes fetched successfully",
      attributes,
    });
  } catch (error) {
    console.log("GET ATTRIBUTES ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch attributes",
      error: error.message,
    });
  }
};

const getAttributeById = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    return res.status(200).json({
      message: "Attribute fetched successfully",
      attribute,
    });
  } catch (error) {
    console.log("GET ATTRIBUTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch attribute",
      error: error.message,
    });
  }
};

const createAttribute = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Attribute name is required",
      });
    }

    const cleanName = name.trim();

    const existingAttribute = await Attribute.findOne({
      name: {
        $regex: `^${cleanName}$`,
        $options: "i",
      },
    });

    if (existingAttribute) {
      return res.status(409).json({
        message: "Attribute already exists",
      });
    }

    const attribute = await Attribute.create({
      name: cleanName,
      values: [],
    });

    return res.status(201).json({
      message: "Attribute created successfully",
      attribute,
    });
  } catch (error) {
    console.log("CREATE ATTRIBUTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to create attribute",
      error: error.message,
    });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Attribute name is required",
      });
    }

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    const existingAttribute = await Attribute.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingAttribute) {
      return res.status(409).json({
        message: "Another attribute with this name already exists",
      });
    }

    attribute.name = name.trim();

    await attribute.save();

    return res.status(200).json({
      message: "Attribute updated successfully",
      attribute,
    });
  } catch (error) {
    console.log("UPDATE ATTRIBUTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to update attribute",
      error: error.message,
    });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    attribute.isActive = false;

    await attribute.save();

    return res.status(200).json({
      message: "Attribute deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ATTRIBUTE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete attribute",
      error: error.message,
    });
  }
};

const addAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({
        message: "Attribute value is required",
      });
    }

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    const cleanValue = value.trim();

    const existingValue = attribute.values.find(
      (item) =>
        item.value.toLowerCase() === cleanValue.toLowerCase() && item.isActive,
    );

    if (existingValue) {
      return res.status(409).json({
        message: "Attribute value already exists",
      });
    }

    attribute.values.push({
      value: cleanValue,
      isActive: true,
    });

    await attribute.save();

    const newValue = attribute.values[attribute.values.length - 1];

    return res.status(201).json({
      message: "Attribute value added successfully",
      attribute,
      value: newValue,
    });
  } catch (error) {
    console.log("ADD ATTRIBUTE VALUE ERROR:", error);

    return res.status(500).json({
      message: "Failed to add attribute value",
      error: error.message,
    });
  }
};

const updateAttributeValue = async (req, res) => {
  try {
    const { id, valueId } = req.params;
    const { value } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({
        message: "Attribute value is required",
      });
    }

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    const attributeValue = attribute.values.id(valueId);

    if (!attributeValue) {
      return res.status(404).json({
        message: "Attribute value not found",
      });
    }

    const cleanValue = value.trim();

    const duplicateValue = attribute.values.find(
      (item) =>
        item._id.toString() !== valueId &&
        item.value.toLowerCase() === cleanValue.toLowerCase() &&
        item.isActive,
    );

    if (duplicateValue) {
      return res.status(409).json({
        message: "Attribute value already exists",
      });
    }

    attributeValue.value = cleanValue;

    await attribute.save();

    return res.status(200).json({
      message: "Attribute value updated successfully",
      attribute,
    });
  } catch (error) {
    console.log("UPDATE ATTRIBUTE VALUE ERROR:", error);

    return res.status(500).json({
      message: "Failed to update attribute value",
      error: error.message,
    });
  }
};

const deleteAttributeValue = async (req, res) => {
  try {
    const { id, valueId } = req.params;

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return res.status(404).json({
        message: "Attribute not found",
      });
    }

    const attributeValue = attribute.values.id(valueId);

    if (!attributeValue) {
      return res.status(404).json({
        message: "Attribute value not found",
      });
    }

    attributeValue.isActive = false;

    await attribute.save();

    return res.status(200).json({
      message: "Attribute value deleted successfully",
      attribute,
    });
  } catch (error) {
    console.log("DELETE ATTRIBUTE VALUE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete attribute value",
      error: error.message,
    });
  }
};

module.exports = {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
};

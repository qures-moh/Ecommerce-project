
const Subcategory = require("../model/Subcategory");
const Category = require("../model/Category");

const addSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Subcategory image is required",
      });
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const existingSubcategory = await Subcategory.findOne({
      name: name.trim(),
      category,
    });

    if (existingSubcategory) {
      return res.status(400).json({
        message: "Subcategory already exists in this category",
      });
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      category,
      description: description || "",
      image: req.file.path,
    });

    res.status(201).json({
      message: "Subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create subcategory",
      error: error.message,
    });
  }
};

const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const subcategories = await Subcategory.find({
      category: categoryId,
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id).populate(
      "category",
      "name"
    );

    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subcategory",
      error: error.message,
    });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, isActive } = req.body;

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }

    if (category) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    if (name || category) {
      const duplicateSubcategory = await Subcategory.findOne({
        _id: { $ne: id },
        name: name ? name.trim() : subcategory.name,
        category: category || subcategory.category,
      });

      if (duplicateSubcategory) {
        return res.status(400).json({
          message: "Subcategory already exists in this category",
        });
      }
    }

    if (name !== undefined) {
      subcategory.name = name.trim();
    }

    if (category !== undefined) {
      subcategory.category = category;
    }

    if (description !== undefined) {
      subcategory.description = description;
    }

    if (isActive !== undefined) {
      subcategory.isActive = isActive;
    }

    if (req.file) {
      subcategory.image = req.file.path;
    }

    await subcategory.save();

    res.status(200).json({
      message: "Subcategory updated successfully",
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update subcategory",
      error: error.message,
    });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }

    subcategory.isActive = false;

    await subcategory.save();

    res.status(200).json({
      message: "Subcategory deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete subcategory",
      error: error.message,
    });
  }
};

module.exports = {
  addSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
};

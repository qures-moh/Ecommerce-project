const Category = require("../model/Category");
const Product = require("../model/Product");

const getCategories = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const categories = await Category.find(filter).sort({
      createdAt: -1,
    });

    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const productCount =
          await Product.countDocuments({
            category: category._id,
            isActive: true,
          });

        return {
          ...category.toObject(),
          productCount,
        };
      })
    );

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories: categoriesWithProducts,
    });
  } catch (error) {
    console.log("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      message: "Failed to get categories",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      _id: id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    console.log("GET CATEGORY BY ID ERROR:", error);

    return res.status(500).json({
      message: "Failed to get category",
      error: error.message,
    });
  }
};

const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      _id: id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const products = await Product.find({
      category: category._id,
      isActive: true,
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Category products fetched successfully",
      category,
      products,
      productCount: products.length,
    });
  } catch (error) {
    console.log(
      "GET CATEGORY PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to get category products",
      error: error.message,
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Category image is required",
      });
    }

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
      });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const image =
      req.file.path || req.file.filename;

    const category = await Category.create({
      name: name.trim(),
      description:
        description?.trim() || "",
      image,
      isActive: true,
    });

    return res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.log("ADD CATEGORY ERROR:", error);

    return res.status(500).json({
      message: "Failed to add category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isActive,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const updateData = {
      name: name.trim(),
      description:
        description?.trim() || "",
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : category.isActive,
    };

    if (req.file) {
      updateData.image =
        req.file.path ||
        req.file.filename;
    }

    const updatedCategory =
      await Category.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

const updateCategoryStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message:
          "isActive must be true or false",
      });
    }

    const category =
      await Category.findByIdAndUpdate(
        id,
        {
          isActive,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message:
        "Category status updated successfully",
      category,
    });
  } catch (error) {
    console.log(
      "UPDATE CATEGORY STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update category status",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productCount =
      await Product.countDocuments({
        category: category._id,
      });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category because ${productCount} product${
          productCount > 1
            ? "s are"
            : " is"
        } using it`,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(
      "DELETE CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryProducts,
  addCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};
const Product = require("../model/Product");
const Category = require("../model/Category");
const Subcategory = require("../model/Subcategory");
const Attribute = require("../model/Attribute");
const fs = require("fs");
const path = require("path");

const removeFile = (filePath) => {
  if (!filePath) return;

  const cleanPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");

  const fullPath = path.join(__dirname, "..", cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const getImagePath = (file) => {
  if (!file) return "";

  return `/uploads/${file.filename}`;
};

const parseVariants = (variants) => {
  if (!variants) {
    return null;
  }

  if (Array.isArray(variants)) {
    return variants;
  }

  try {
    return JSON.parse(variants);
  } catch (error) {
    return null;
  }
};

const validateVariants = async (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return {
      valid: false,
      message: "At least one variant is required",
    };
  }

  const duplicateVariants = new Set();

  for (const variant of variants) {
    if (!variant || typeof variant !== "object") {
      return {
        valid: false,
        message: "Invalid variant data",
      };
    }

    if (!variant.attributes || typeof variant.attributes !== "object") {
      return {
        valid: false,
        message: "Each variant must contain attributes",
      };
    }

    const attributeEntries = Object.entries(variant.attributes);

    if (attributeEntries.length === 0) {
      return {
        valid: false,
        message: "Each variant must have at least one attribute",
      };
    }

    for (const [attributeName, attributeValue] of attributeEntries) {
      const cleanAttributeName = String(attributeName).trim();
      const cleanAttributeValue = String(attributeValue).trim();

      if (!cleanAttributeName) {
        return {
          valid: false,
          message: "Attribute name cannot be empty",
        };
      }

      if (!cleanAttributeValue) {
        return {
          valid: false,
          message: `Value for ${cleanAttributeName} cannot be empty`,
        };
      }

      const attribute = await Attribute.findOne({
        name: {
          $regex: `^${cleanAttributeName}$`,
          $options: "i",
        },
        isActive: true,
      });

      if (!attribute) {
        return {
          valid: false,
          message: `Attribute "${cleanAttributeName}" does not exist or is inactive`,
        };
      }

      const attributeValueExists = attribute.values.some(
        (item) =>
          item.isActive &&
          item.value.toLowerCase() === cleanAttributeValue.toLowerCase(),
      );

      if (!attributeValueExists) {
        return {
          valid: false,
          message: `Value "${cleanAttributeValue}" is not available for attribute "${attribute.name}"`,
        };
      }
    }

    if (
      variant.price === undefined ||
      variant.price === null ||
      variant.price === "" ||
      Number.isNaN(Number(variant.price)) ||
      Number(variant.price) < 0
    ) {
      return {
        valid: false,
        message: "Variant price must be a valid number",
      };
    }

    if (
      variant.stock !== undefined &&
      variant.stock !== null &&
      variant.stock !== "" &&
      (Number.isNaN(Number(variant.stock)) || Number(variant.stock) < 0)
    ) {
      return {
        valid: false,
        message: "Variant stock must be a valid number",
      };
    }

    const discountType = variant.discountType || null;

    if (
      discountType !== null &&
      discountType !== "flat" &&
      discountType !== "percentage"
    ) {
      return {
        valid: false,
        message: "Invalid discount type",
      };
    }

    const discountValue =
      variant.discountValue === undefined ||
      variant.discountValue === null ||
      variant.discountValue === ""
        ? 0
        : Number(variant.discountValue);

    if (Number.isNaN(discountValue) || discountValue < 0) {
      return {
        valid: false,
        message: "Discount value must be a valid number",
      };
    }

    if (discountType === "percentage" && discountValue > 100) {
      return {
        valid: false,
        message: "Percentage discount cannot exceed 100",
      };
    }

    const variantKey = Object.entries(variant.attributes)
      .map(
        ([name, value]) =>
          `${String(name).trim().toLowerCase()}:${String(value)
            .trim()
            .toLowerCase()}`,
      )
      .sort()
      .join("|");

    if (duplicateVariants.has(variantKey)) {
      return {
        valid: false,
        message: "Duplicate variants are not allowed",
      };
    }

    duplicateVariants.add(variantKey);
  }

  return {
    valid: true,
  };
};

const addProduct = async (req, res) => {
  try {
    const { name, category, subcategory, description } = req.body;

    if (!name || !category || !subcategory || !description) {
      return res.status(400).json({
        message: "Name, category, subcategory and description are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const subcategoryExists = await Subcategory.findById(subcategory);

    if (!subcategoryExists) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }

    if (
      subcategoryExists.category &&
      subcategoryExists.category.toString() !== category.toString()
    ) {
      return res.status(400).json({
        message: "Selected subcategory does not belong to selected category",
      });
    }

    const variants = parseVariants(req.body.variants);

    if (!variants) {
      return res.status(400).json({
        message: "Invalid variants data",
      });
    }

    const validation = await validateVariants(variants);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const files = req.files || [];

    const formattedVariants = variants.map((variant, index) => {
      const variantFiles = files.filter(
        (file) => file.fieldname === `variant_${index}_images`,
      );

      const images = variantFiles.map(getImagePath);

      const attributes = {};

      Object.entries(variant.attributes).forEach(([key, value]) => {
        attributes[key.trim()] = String(value).trim();
      });

      return {
        attributes,
        price: Number(variant.price),
        discountType: variant.discountType || null,
        discountValue: Number(variant.discountValue) || 0,
        stock: Number(variant.stock) || 0,
        images,
        isActive: variant.isActive !== false,
      };
    });

    const product = await Product.create({
      name: name.trim(),
      category,
      subcategory,
      description: description.trim(),
      variants: formattedVariants,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subcategory", "name");

    return res.status(201).json({
      message: "Product added successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 10 } = req.query;

    const query = {
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.max(Number(limit) || 10, 1);

    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("subcategory", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("subcategory", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const { name, category, subcategory, description } = req.body;

    if (!name || !category || !subcategory || !description) {
      return res.status(400).json({
        message: "Name, category, subcategory and description are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const subcategoryExists = await Subcategory.findById(subcategory);

    if (!subcategoryExists) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }

    if (
      subcategoryExists.category &&
      subcategoryExists.category.toString() !== category.toString()
    ) {
      return res.status(400).json({
        message: "Selected subcategory does not belong to selected category",
      });
    }

    const variants = parseVariants(req.body.variants);

    if (!variants) {
      return res.status(400).json({
        message: "Invalid variants data",
      });
    }

    const validation = await validateVariants(variants);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const files = req.files || [];

    const oldVariants = product.variants || [];

    const formattedVariants = variants.map((variant, index) => {
      const variantFiles = files.filter(
        (file) => file.fieldname === `variant_${index}_images`,
      );

      const newImages = variantFiles.map(getImagePath);

      const oldVariantId = variant._id || variant.id;

      const oldVariant = oldVariants.find(
        (item) => item._id.toString() === String(oldVariantId),
      );

      let images = oldVariant ? [...oldVariant.images] : [];

      if (newImages.length > 0) {
        images.forEach(removeFile);

        images = newImages;
      }

      const attributes = {};

      Object.entries(variant.attributes).forEach(([key, value]) => {
        attributes[key.trim()] = String(value).trim();
      });

      return {
        _id: oldVariant ? oldVariant._id : undefined,

        attributes,

        price: Number(variant.price),

        discountType: variant.discountType || null,

        discountValue: Number(variant.discountValue) || 0,

        stock: Number(variant.stock) || 0,

        images,

        isActive: variant.isActive !== false,
      };
    });

    const newVariantIds = new Set(
      formattedVariants
        .filter((variant) => variant._id)
        .map((variant) => variant._id.toString()),
    );

    oldVariants.forEach((oldVariant) => {
      if (!newVariantIds.has(oldVariant._id.toString())) {
        oldVariant.images.forEach(removeFile);
      }
    });

    product.name = name.trim();

    product.category = category;

    product.subcategory = subcategory;

    product.description = description.trim();

    product.variants = formattedVariants;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subcategory", "name");

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.variants.forEach((variant) => {
      variant.images.forEach(removeFile);
    });

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

const deleteAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        variant.images.forEach(removeFile);
      });
    });

    await Product.deleteMany({});

    return res.status(200).json({
      message: "All products deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ALL PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete all products",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
};

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const Product = require("./model/Product");
const Category = require("./model/Category");
const Subcategory = require("./model/Subcategory");
const Tag = require("./model/Tag");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const uploadDir = path.join(__dirname, "uploads");

const generateFilename = (extension) => {
  return `${Date.now()}-${Math.floor(
    100000 + Math.random() * 900000
  )}${extension}`;
};

const copyImage = (sourceName) => {
  const sourcePath = path.join(uploadDir, sourceName);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Image not found: ${sourceName}`);
  }

  const extension = path.extname(sourceName);
  const generatedName = generateFilename(extension);
  const destinationPath = path.join(uploadDir, generatedName);

  fs.copyFileSync(sourcePath, destinationPath);

  return generatedName;
};

const deleteProductImages = async (product) => {
  if (!product?.variants) return;

  for (const variant of product.variants) {
    if (!variant.images) continue;

    for (const image of variant.images) {
      const imagePath = path.join(uploadDir, image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  }
};

const getOrCreateTags = async (tagNames) => {
  const tags = [];

  for (const name of tagNames) {
    const cleanName = name.trim().toLowerCase();

    let tag = await Tag.findOne({
      name: cleanName,
    });

    if (!tag) {
      tag = await Tag.create({
        name: cleanName,
        isActive: true,
      });
    }

    if (tag.isActive) {
      tags.push(tag.name);
    }
  }

  return tags;
};

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const category = await Category.findOne({
      name: "Home & Kitchen",
    });

    if (!category) {
      throw new Error(
        "Home & Kitchen category not found."
      );
    }

    const subcategory = await Subcategory.findOne({
      name: "Home Storage & Organization",
      category: category._id,
    });

    if (!subcategory) {
      throw new Error(
        "Home Storage & Organization subcategory not found."
      );
    }

    const products = [
      {
        name: "Plastic Storage Box",
        description:
          "Durable storage box designed to keep clothes, household items and everyday belongings organized and protected.",
        price: 899,
        discountType: "percentage",
        discountValue: 15,
        stock: 60,
        tags: [
          "home-kitchen",
          "home-storage",
          "storage",
          "organization",
          "storage-box",
        ],
        sourceImages: [
          "plastic-storage-box-1.jpeg",
          "plastic-storage-box-2.jpeg",
        ],
      },
      {
        name: "Kitchen Organizer",
        description:
          "Practical kitchen organizer designed to keep utensils, containers and everyday kitchen essentials neatly arranged.",
        price: 699,
        discountType: "percentage",
        discountValue: 10,
        stock: 50,
        tags: [
          "home-kitchen",
          "home-storage",
          "kitchen-storage",
          "organization",
          "kitchen-organizer",
        ],
        sourceImages: [
          "kitchen-organizer-1.jpeg",
          "kitchen-organizer-2.jpeg",
        ],
      },
      {
        name: "Shoe Rack",
        description:
          "Space-saving shoe rack designed to organize footwear neatly while keeping entryways and rooms clutter-free.",
        price: 1999,
        discountType: "percentage",
        discountValue: 20,
        stock: 30,
        tags: [
          "home-kitchen",
          "home-storage",
          "organization",
          "shoe-storage",
          "shoe-rack",
        ],
        sourceImages: [
          "shoe-rack-1.jpeg",
          "shoe-rack-2.jpeg",
        ],
      },
      {
        name: "Clothes Storage Organizer",
        description:
          "Convenient clothes storage organizer designed to keep garments, blankets and seasonal clothing neatly stored.",
        price: 799,
        discountType: "percentage",
        discountValue: 15,
        stock: 55,
        tags: [
          "home-kitchen",
          "home-storage",
          "organization",
          "clothing-storage",
          "storage-box",
        ],
        sourceImages: [
          "clothes-storage-organizer-1.jpeg",
          "clothes-storage-organizer-2.jpeg",
        ],
      },
      {
        name: "Multipurpose Storage Basket",
        description:
          "Multipurpose storage basket suitable for organizing toys, clothes, household accessories and everyday items.",
        price: 599,
        discountType: "percentage",
        discountValue: 10,
        stock: 70,
        tags: [
          "home-kitchen",
          "home-storage",
          "storage",
          "organization",
          "storage-basket",
        ],
        sourceImages: [
          "multipurpose-storage-basket-1.jpeg",
          "multipurpose-storage-basket-2.jpeg",
        ],
      },
      {
        name: "Bathroom Organizer",
        description:
          "Compact bathroom organizer designed to neatly store toiletries, cosmetics and everyday bathroom essentials.",
        price: 749,
        discountType: "percentage",
        discountValue: 15,
        stock: 45,
        tags: [
          "home-kitchen",
          "home-storage",
          "organization",
          "bathroom-storage",
          "bathroom-organizer",
        ],
        sourceImages: [
          "bathroom-organizer-1.jpeg",
          "bathroom-organizer-2.jpeg",
        ],
      },
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        name: productData.name,
      });

      if (existingProduct) {
        await deleteProductImages(existingProduct);

        await Product.findByIdAndDelete(
          existingProduct._id
        );

        console.log(
          `Deleted existing: ${productData.name}`
        );
      }

      const tags = await getOrCreateTags(
        productData.tags
      );

      const generatedImages = [];

      for (const sourceImage of productData.sourceImages) {
        const generatedImage = copyImage(sourceImage);

        generatedImages.push(generatedImage);

        console.log(
          `${productData.name} image: ${generatedImage}`
        );
      }

      const product = await Product.create({
        name: productData.name,
        category: category._id,
        subcategory: subcategory._id,
        tags,
        description: productData.description,
        variants: [
          {
            attributes: {
              color: "Default",
              size: "Default",
            },
            price: productData.price,
            discountType: productData.discountType,
            discountValue: productData.discountValue,
            stock: productData.stock,
            images: generatedImages,
            isActive: true,
          },
        ],
        isActive: true,
      });

      console.log(`Created: ${product.name}`);
      console.log("Tags:", product.tags);
      console.log(
        "Images:",
        product.variants[0].images
      );

      console.log(
        "Image URLs:",
        product.variants[0].images.map(
          (image) =>
            `http://localhost:3000/uploads/${image}`
        )
      );

      console.log("--------------------------------");
    }

    console.log(
      "All 6 Home Storage & Organization products seeded successfully."
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("SEED ERROR:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedProducts();
const Product = require("../model/Product");
const Order = require("../model/Order");

const placeOrder = async (req, res) => {
  try {
    const {
      items,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pinCode,
      paymentMethod,
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        message: "Please login to place an order",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pinCode
    ) {
      return res.status(400).json({
        message: "All shipping details are required",
      });
    }

    if (!["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({
          message: "Product is required",
        });
      }

      if (!item.variantId) {
        return res.status(400).json({
          message: "Product variant is required",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Invalid quantity",
        });
      }

      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found or unavailable",
        });
      }

      const variant = product.variants.id(item.variantId);

      if (!variant) {
        return res.status(404).json({
          message: `Selected variant for ${product.name} was not found`,
        });
      }

      if (!variant.isActive) {
        return res.status(400).json({
          message: `${product.name} selected variant is unavailable`,
        });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          message: `${product.name} selected variant has only ${variant.stock} item(s) available`,
        });
      }

      let finalPrice = Number(variant.price);

      if (variant.discountType === "flat") {
        finalPrice =
          finalPrice - Number(variant.discountValue || 0);
      }

      if (variant.discountType === "percentage") {
        finalPrice =
          finalPrice -
          (finalPrice * Number(variant.discountValue || 0)) / 100;
      }

      if (finalPrice < 0) {
        finalPrice = 0;
      }

      finalPrice = Number(finalPrice.toFixed(2));

      const itemTotal = Number(
        (finalPrice * quantity).toFixed(2)
      );

      subtotal += itemTotal;

      const attributes = variant.attributes
        ? Object.fromEntries(variant.attributes)
        : {};

      orderItems.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        attributes,
        image: variant.images?.[0] || "",
        price: finalPrice,
        quantity,
        total: itemTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    const shipping = 0;

    const total = Number(
      (subtotal + shipping).toFixed(2)
    );

    const updatedProducts = [];

    for (const item of orderItems) {
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        for (const updated of updatedProducts) {
          const rollbackVariant = updated.product.variants.id(
            updated.variantId
          );

          if (rollbackVariant) {
            rollbackVariant.stock += updated.quantity;
            await updated.product.save();
          }
        }

        return res.status(400).json({
          message: `${item.name} is no longer available`,
        });
      }

      const variant = product.variants.id(item.variantId);

      if (!variant || !variant.isActive) {
        for (const updated of updatedProducts) {
          const rollbackVariant = updated.product.variants.id(
            updated.variantId
          );

          if (rollbackVariant) {
            rollbackVariant.stock += updated.quantity;
            await updated.product.save();
          }
        }

        return res.status(400).json({
          message: `${item.name} selected variant is no longer available`,
        });
      }

      if (variant.stock < item.quantity) {
        for (const updated of updatedProducts) {
          const rollbackVariant = updated.product.variants.id(
            updated.variantId
          );

          if (rollbackVariant) {
            rollbackVariant.stock += updated.quantity;
            await updated.product.save();
          }
        }

        return res.status(400).json({
          message: `${item.name} selected variant is no longer available in the requested quantity`,
        });
      }

      variant.stock -= item.quantity;

      await product.save();

      updatedProducts.push({
        product,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const paymentStatus =
      paymentMethod === "online"
        ? "paid"
        : "pending";

    let order;

    try {
      order = await Order.create({
        user: req.userId,

        items: orderItems,

        shippingAddress: {
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state,
          pinCode,
        },

        subtotal,
        shipping,
        total,

        paymentMethod,

        paymentStatus,

        status: "confirmed",
      });
    } catch (error) {
      for (const updated of updatedProducts) {
        const rollbackProduct = await Product.findById(
          updated.product._id
        );

        if (!rollbackProduct) {
          continue;
        }

        const rollbackVariant = rollbackProduct.variants.id(
          updated.variantId
        );

        if (rollbackVariant) {
          rollbackVariant.stock += updated.quantity;
          await rollbackProduct.save();
        }
      }

      throw error;
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log("PLACE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Please login to view your orders",
      });
    }

    const orders = await Order.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log("GET ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Please login to view your order",
      });
    }

    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.log("GET ORDER ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
};

const User = require("../model/User");
const Product = require("../model/Product");
const Order = require("../model/Order");

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "customer",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const recentOrders = await Order.find()
      .populate(
        "user",
        "firstName lastName email"
      )
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      stats: {
        totalUsers,
        totalAdmins,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    console.log("GET DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const filter = {
      role: "customer",
    };

    if (search) {
      filter.$or = [
        {
          firstName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalUsers =
      await User.countDocuments(filter);

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
      currentPage: pageNumber,
      totalPages: Math.ceil(
        totalUsers / limitNumber
      ),
      totalUsers,
    });
  } catch (error) {
    console.log("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// const getAllOrders = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       status,
//       paymentStatus,
//     } = req.query;

//     const pageNumber = Math.max(Number(page), 1);
//     const limitNumber = Math.max(Number(limit), 1);

//     const filter = {};

//     if (status) {
//       filter.status = status;
//     }

//     if (paymentStatus) {
//       filter.paymentStatus = paymentStatus;
//     }

//     const orders = await Order.find(filter)
//       .populate(
//         "user",
//         "firstName lastName email"
//       )
//       .sort({ createdAt: -1 })
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     const totalOrders =
//       await Order.countDocuments(filter);

//     return res.status(200).json({
//       message: "Orders fetched successfully",
//       orders,
//       currentPage: pageNumber,
//       totalPages: Math.ceil(
//         totalOrders / limitNumber
//       ),
//       totalOrders,
//     });
//   } catch (error) {
//     console.log("GET ALL ORDERS ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to fetch orders",
//       error: error.message,
//     });
//   }
// };
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      paymentStatus,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const searchValue = search.trim();

    if (searchValue) {
      const escapedSearch = searchValue
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/^#/, "");

      const users = await User.find({
        $or: [
          {
            firstName: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id);

      filter.$or = [
        {
          user: {
            $in: userIds,
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: "$_id",
              },
              regex: escapedSearch,
              options: "i",
            },
          },
        },
      ];
    }

    const orders = await Order.find(filter)
      .populate(
        "user",
        "firstName lastName email"
      )
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalOrders =
      await Order.countDocuments(filter);

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      currentPage: pageNumber,
      totalPages: Math.ceil(
        totalOrders / limitNumber
      ),
      totalOrders,
    });
  } catch (error) {
    console.log("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Order status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled order cannot be updated",
      });
    }

    if (
      order.status === "delivered" &&
      status !== "delivered"
    ) {
      return res.status(400).json({
        message: "Delivered order cannot be changed",
      });
    }

    if (
      status === "cancelled" &&
      order.status !== "cancelled"
    ) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          continue;
        }

        const variant = product.variants.id(item.variantId);

        if (!variant) {
          continue;
        }

        variant.stock += Number(item.quantity);

        await product.save();
      }
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const allowedStatuses = [
//       "pending",
//       "confirmed",
//       "processing",
//       "shipped",
//       "out_for_delivery",
//       "delivered",
//       "cancelled",
//     ];

//     if (!status) {
//       return res.status(400).json({
//         message: "Order status is required",
//       });
//     }

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         message: "Invalid order status",
//       });
//     }

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found",
//       });
//     }

//     if (order.status === "cancelled") {
//       return res.status(400).json({
//         message: "Cancelled order cannot be updated",
//       });
//     }

//     if (
//       order.status === "delivered" &&
//       status !== "delivered"
//     ) {
//       return res.status(400).json({
//         message: "Delivered order cannot be changed",
//       });
//     }

//     if (
//       status === "cancelled" &&
//       order.status !== "cancelled"
//     ) {
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(
//           item.product,
//           {
//             $inc: {
//               stock: item.quantity,
//             },
//           }
//         );
//       }
//     }

//     order.status = status;

//     await order.save();

//     return res.status(200).json({
//       message: "Order status updated successfully",
//       order,
//     });
//   } catch (error) {
//     console.log(
//       "UPDATE ORDER STATUS ERROR:",
//       error
//     );

//     return res.status(500).json({
//       message: "Failed to update order status",
//       error: error.message,
//     });
//   }
// };

// const updateUserStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body;

//     if (typeof isActive !== "boolean") {
//       return res.status(400).json({
//         message: "isActive must be true or false",
//       });
//     }

//     const user = await User.findById(id);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     if (user.role === "admin") {
//       return res.status(403).json({
//         message: "Admin status cannot be changed",
//       });
//     }

//     user.isActive = isActive;

//     await user.save();

//     return res.status(200).json({
//       message: "User status updated successfully",
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         isActive: user.isActive,
//       },
//     });
//   } catch (error) {
//     console.log(
//       "UPDATE USER STATUS ERROR:",
//       error
//     );

//     return res.status(500).json({
//       message: "Failed to update user status",
//       error: error.message,
//     });
//   }
// };

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be deleted",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("DELETE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "user",
      "firstName lastName email"
    );

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
    console.log(
      "GET ORDER BY ID ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "customer",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const orders = await Order.find({
      user: id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User fetched successfully",
      user,
      orders,
    });
  } catch (error) {
    console.log(
      "GET USER BY ID ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to get user",
      error: error.message,
    });
  }
};
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin status cannot be changed",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      message: "User status updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.log(
      "UPDATE USER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    });
  }
};
module.exports = {
  getDashboard,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  updateUserStatus,
  deleteUser,
  getOrderById,
  getUserById,
};

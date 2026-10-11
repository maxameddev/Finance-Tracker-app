import User from "../models/users.js";
import Transaction from "../models/Transaction.js";

export const getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      totalTransactions,
      spendingByCategory,
    });
  } catch (error) {
    next(error);
  }
};
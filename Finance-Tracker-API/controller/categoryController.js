export const getCategories = (req, res) => {
  res.status(200).json({
    categories: [
      "Food",
      "Transport",
      "Bills",
      "Salary",
      "Shopping",
      "Health",
      "Education",
      "Other",
    ],
  });
};
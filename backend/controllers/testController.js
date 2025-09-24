const testController = (req, res) => {
  return res.status(200).send("Test route is working ✅");
};

module.exports = { testController };

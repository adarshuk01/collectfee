// controllers/subscriptionController.js
const SubscriptionPackage = require("../models/SubscriptionPackage");

// Create subscription package
exports.createSubscription = async (req, res) => {
  try {
    const { subscriptionName, admissionFee, billingCycle, customFields } = req.body;

    // Calculate recurringAmount
    const recurringAmount = customFields
      ?.filter((f) => f.isRecurring)
      .reduce((sum, f) => sum + Number(f.value || 0), 0);

    const newPackage = await SubscriptionPackage.create({
      subscriptionName,
      admissionFee,
      billingCycle,
      customFields,
      clientId: req.user.id,
      recurringAmount,
    });

    res.status(201).json({
      message: "Subscription Package Created",
      data: newPackage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Get all packages
exports.getSubscriptions = async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({ clientId: req.user.id });
    res.json({ data: packages });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get single package
exports.getSingleSubscription = async (req, res) => {
  try {
    const pkg = await SubscriptionPackage.findOne({
      _id: req.params.id,
      clientId: req.user.id,
    });

    if (!pkg) return res.status(404).json({ message: "Package Not Found" });

    res.json({ data: pkg });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update package
exports.updateSubscription = async (req, res) => {
  try {
    const { customFields } = req.body;
    console.log(req.body);
    

    // Recalculate recurringAmount on update
    const recurringAmount = customFields
      ?.filter((f) => f.isRecurring)
      .reduce((sum, f) => sum + Number(f.value || 0), 0);

    req.body.recurringAmount = recurringAmount;

    const updated = await SubscriptionPackage.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Package Not Found" });

    res.json({ message: "Updated Successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete package
exports.deleteSubscription = async (req, res) => {
  try {
    const deleted = await SubscriptionPackage.findOneAndDelete({
      _id: req.params.id,
      clientId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Package Not Found" });

    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

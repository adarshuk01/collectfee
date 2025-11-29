const ReceiptSettings = require("../models/ReceiptSettings");


// GET settings for logged-in client
exports.getReceiptSettings = async (req, res) => {
  try {
    const clientId = req.user.id;

    let settings = await ReceiptSettings.findOne({ clientId:clientId });

    // Auto-create blank settings for new users
    if (!settings) {
      settings = await ReceiptSettings.create({ clientId });
    }

    res.json({ success: true, settings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReceiptSettings = async (req, res) => {
  try {
    const {
      businessName,
      email,
      phone,
      address,
      themeColor,
      textColor,
      footerMessage,
    } = req.body;

      const clientId = req.user.id;


    let logoUrl = null;

    if (req.file) {
      logoUrl = req.file.path; // Cloudinary URL
    }

    let settings = await ReceiptSettings.findOne({clientId:clientId});

    if (settings) {
      // Update
      settings.businessName = businessName;
      settings.email = email;
      settings.phone = phone;
      settings.address = address;
      settings.themeColor = themeColor;
      settings.textColor = textColor;
      settings.footerMessage = footerMessage;

      if (logoUrl) settings.logoUrl = logoUrl;

      await settings.save();
    } else {
      // Create
      settings = await ReceiptSettings.create({
        businessName,
        email,
        phone,
        address,
        themeColor,
        textColor,
        footerMessage,
        logoUrl,
      });
    }

    res.json({
      success: true,
      message: "Receipt settings updated",
      settings,
    });
  } catch (error) {
    console.log("Settings update error", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

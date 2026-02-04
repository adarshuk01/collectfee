const { getIntentFromMessage } = require("../services/aiIntent.service");
const { handleIntent } = require("../services/chatQuery.service");

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const clientId = req.user.id; // 🔥 logged-in user
    console.log(message);
    

    const intentData = await getIntentFromMessage(message);
    const data = await handleIntent(intentData, clientId);

    res.json({
      intent: intentData.intent,
      data
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat processing failed" });
  }
};

module.exports = { chatWithBot };

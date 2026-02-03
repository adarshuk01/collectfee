const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,           // 👈 Groq key
  baseURL: "https://api.groq.com/openai/v1",  // 👈 Groq endpoint
});

const getIntentFromMessage = async (message) => {
  const prompt = `
You are an intent classifier for a fee management system.

Allowed intents:
- TOTAL_COLLECTION
- EXPIRING_SUBSCRIPTIONS
- PENDING_FEES
- INACTIVE_MEMBERS
- SEND_REMINDER

If applicable, also extract:
- month (1-12)
- year (YYYY)
- days
- minDue
- maxDue

If unsure, return:
{"intent":"UNKNOWN"}

User message:
"${message}"

Return ONLY valid JSON.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b", // ✅ Gemma (best available on Groq)
      messages: [
        { role: "system", content: "Return only JSON. No explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    console.log(response.choices[0].message.content);
    

    const content = response.choices[0].message.content;

    // 🛡️ safety: extract JSON only
    const json = content.match(/\{[\s\S]*\}/)?.[0];

    return JSON.parse(json);
  } catch (err) {
    console.error("Gemma intent error:", err.message);
    return { intent: "UNKNOWN" };
  }
};

module.exports = { getIntentFromMessage };

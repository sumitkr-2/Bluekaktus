
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const quotes = [
  {
    id: 1,
    supplier_name: "Delhi Textiles",
    fabric_type: "Cotton",
    gsm: 180,
    quantity: 10000,
    price_per_metre: 92,
    freight: 20000,
    tax: 0,
    delivery_days: 7,
    rating: 4.5
  },
  {
    id: 2,
    supplier_name: "Surat Fabrics",
    fabric_type: "Cotton",
    gsm: 180,
    quantity: 10000,
    price_per_metre: 88,
    freight: 35000,
    tax: 0,
    delivery_days: 10,
    rating: 4.7
  },
  {
    id: 3,
    supplier_name: "Mumbai Cotton Co.",
    fabric_type: "Cotton",
    gsm: 180,
    quantity: 10000,
    price_per_metre: 85,
    freight: 60000,
    tax: 0,
    delivery_days: 5,
    rating: 4.2
  }
];

app.get("/", (req, res) => {
  res.send("FabricSave AI backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "FabricSave AI" });
});

app.get("/api/quotes", (req, res) => {
  res.json(
    quotes.map(q => ({
      ...q,
      total_cost:
        q.price_per_metre * q.quantity + q.freight + q.tax
    }))
  );
});

app.post("/api/agent/chat", async (req, res) => {
  const { message = "", requirement = {} } = req.body;
  const key = process.env.GEMINI_API_KEY;

  if (!message.trim()) {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  // Handle greetings without unnecessary AI calls.
  if (/^(hi+|hello|hey)[!. ]*$/i.test(message.trim())) {
    return res.json({
      reply: "Hi! I can compare fabric quotations, recommend a supplier, or help draft a counteroffer. What would you like to do?"
    });
  }

  if (!key) {
    return res.status(503).json({
      reply: "Gemini is not configured. Add GEMINI_API_KEY to server/.env."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are FabricSave AI, a fabric procurement assistant.

Answer the buyer's actual question. Do not repeat a generic supplier
recommendation for unrelated messages.

Use only the supplied quotation data. Calculate or verify totals
from the data when needed. Do not invent market prices, supplier
facts, discounts, or completed negotiations.

Supplier quotations:
${JSON.stringify(
  quotes.map(q => ({
    ...q,
    total_cost:
      q.price_per_metre * q.quantity + q.freight + q.tax
  })),
  null,
  2
)}

Buyer requirements: ${JSON.stringify(requirement)}
Buyer message: ${message}

If asked to compare suppliers, discuss price, freight, delivery,
and rating where relevant.
If asked for a counteroffer, suggest a clearly labelled negotiation
target and draft a professional message.
If greeted, respond naturally.
Keep the answer concise and useful.
`
    });

    return res.json({
      reply: response.text || "I couldn't generate a response. Please try again."
    });
  } catch (error) {
    console.error("Gemini error:", error.message);
    return res.status(502).json({
      reply: "The AI service is temporarily unavailable. Please try again."
    });
  }
});

module.exports = app;

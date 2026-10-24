

const sampleQuotes = [
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

export async function getQuotes() {
  try {
    const res = await fetch(`${API}/quotes`);

    if (!res.ok) throw new Error("Request failed");

    return await res.json();
  } catch {
    return sampleQuotes;
  }
}

export async function askAgent(message, quotes = [], requirement = {}) {
  const text = message.trim().toLowerCase();

  if (!text) {
    return "Please enter a message.";
  }

  // Greetings
  if (/^(hi+|hello+|hey+)[!. ]*$/.test(text)) {
    return "Hello! 👋 I'm FabricSave AI. How can I help you today?";
  }

  if (/^good morning\b/.test(text)) {
    return "Good morning! ☀️ How can I help with fabric procurement?";
  }

  if (/^good afternoon\b/.test(text)) {
    return "Good afternoon! 😊 What can I help you with?";
  }

  if (/^good evening\b/.test(text)) {
    return "Good evening! 🌙 How can I assist you today?";
  }

  const suppliers = quotes.length ? quotes : sampleQuotes;

  const total = (s) =>
    Number(s.price_per_metre) * Number(s.quantity) +
    Number(s.freight || 0) +
    Number(s.tax || 0);

  const cheapest = [...suppliers].sort(
    (a, b) => total(a) - total(b)
  )[0];

  if (
    text.includes("negotiate") ||
    text.includes("counteroffer")
  ) {
    const price = (Number(cheapest.price_per_metre) * 0.95).toFixed(2);

    return `Suggested counteroffer: ₹${price} per metre to ${cheapest.supplier_name}.\n\nMessage: Thank you for your quotation. Could you offer a revised rate of ₹${price} per metre while maintaining the same quality and delivery terms?`;
  }

  if (text.includes("saving") || text.includes("save money")) {
    return `${cheapest.supplier_name} has the lowest quoted total cost of ₹${total(cheapest).toLocaleString("en-IN")}. Compare quality and delivery terms before choosing.`;
  }

  if (text.includes("delivery")) {
    const fastest = [...suppliers].sort(
      (a, b) => Number(a.delivery_days) - Number(b.delivery_days)
    )[0];

    return `${fastest.supplier_name} has the fastest listed delivery time: ${fastest.delivery_days} days.`;
  }

  if (
    text.includes("supplier") ||
    text.includes("cheapest") ||
    text.includes("compare") ||
    text.includes("quotation") ||
    text.includes("price")
  ) {
    return `${cheapest.supplier_name} offers the lowest quoted total cost of ₹${total(cheapest).toLocaleString("en-IN")}, at ₹${cheapest.price_per_metre} per metre.`;
  }

  // Unknown question
  return "Can't understand your request.";
}

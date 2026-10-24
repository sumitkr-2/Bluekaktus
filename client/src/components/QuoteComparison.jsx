import { ArrowDownRight, Trophy } from "lucide-react";

export default function QuoteComparison({ quotes = [] }) {
  const ranked = [...quotes].sort((a, b) => {
    const totalA =
      a.price_per_metre * a.quantity + a.freight + (a.tax || 0);
    const totalB =
      b.price_per_metre * b.quantity + b.freight + (b.tax || 0);

    return totalA - totalB;
  });

  const money = n =>
    `₹${Number(n).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="comparison-list">
      {ranked.map((q, i) => {
        const total =
          q.price_per_metre * q.quantity +
          q.freight +
          (q.tax || 0);

        return (
          <div className="comparison-row" key={q.id}>
            <div className="rank">{i + 1}</div>

            <div className="comparison-info">
              <strong>{q.supplier_name || q.name}</strong>
              <small>₹{q.price_per_metre}/metre</small>
            </div>

            <div className="comparison-cost">
              <strong>{money(total)}</strong>
              {i === 0 && (
                <span className="best-label">
                  <Trophy size={12} /> Lowest cost
                </span>
              )}
            </div>
          </div>
        );
      })}

      {ranked.length === 0 && (
        <p className="muted">No quotations to compare.</p>
      )}

      <p className="comparison-note">
        <ArrowDownRight size={15} />
        Ranked by total quoted cost. Verify specifications and delivery
        before making a purchasing decision.
      </p>
    </div>
  );
}
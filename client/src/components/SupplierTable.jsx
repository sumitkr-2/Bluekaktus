export default function SupplierTable({ quotes = [] }) {
  const money = n =>
    `₹${Number(n).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Price / metre</th>
            <th>Freight</th>
            <th>Total cost</th>
            <th>Delivery</th>
            <th>Rating</th>
          </tr>
        </thead>

        <tbody>
          {quotes.map(q => {
            const total =
              Number(q.price_per_metre) * Number(q.quantity) +
              Number(q.freight || 0) +
              Number(q.tax || 0);

            return (
              <tr key={q.id}>
                <td>
                  <strong>{q.supplier_name || q.name}</strong>
                </td>
                <td>{money(q.price_per_metre)}</td>
                <td>{money(q.freight || 0)}</td>
                <td><strong>{money(total)}</strong></td>
                <td>{q.delivery_days} days</td>
                <td>★ {q.rating ?? "—"}</td>
              </tr>
            );
          })}

          {quotes.length === 0 && (
            <tr>
              <td colSpan="6">No quotations available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
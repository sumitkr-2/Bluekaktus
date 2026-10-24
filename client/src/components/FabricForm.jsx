import { useState } from "react";

export default function FabricForm({ onSubmit }) {
  const [form, setForm] = useState({
    fabric_type: "Cotton",
    gsm: 180,
    quantity: 10000,
    target_price: 85
  });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();

    if (
      !form.fabric_type.trim() ||
      Number(form.gsm) <= 0 ||
      Number(form.quantity) <= 0 ||
      Number(form.target_price) <= 0
    ) {
      return;
    }

    onSubmit({
      ...form,
      gsm: Number(form.gsm),
      quantity: Number(form.quantity),
      target_price: Number(form.target_price)
    });
  }

  return (
    <form className="panel fabric-form" onSubmit={submit}>
      <div>
        <h3>Fabric Requirements</h3>
        <p className="muted">Specify the fabric you want to procure.</p>
      </div>

      <label>
        Fabric type
        <select name="fabric_type" value={form.fabric_type} onChange={update}>
          <option>Cotton</option>
          <option>Polyester</option>
          <option>Denim</option>
          <option>Linen</option>
          <option>Cotton Blend</option>
        </select>
      </label>

      <div className="form-grid">
        <label>
          GSM
          <input
            name="gsm"
            type="number"
            min="1"
            value={form.gsm}
            onChange={update}
            required
          />
        </label>

        <label>
          Quantity (metres)
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={update}
            required
          />
        </label>
      </div>

      <label>
        Target price (₹/metre)
        <input
          name="target_price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.target_price}
          onChange={update}
          required
        />
      </label>

      <button className="btn btn-primary" type="submit">
        Find Best Supplier
      </button>
    </form>
  );
}
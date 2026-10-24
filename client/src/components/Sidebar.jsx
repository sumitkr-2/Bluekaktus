import {
  LayoutDashboard,
  Bot,
  History
} from "lucide-react";

const items = [
  { label: "AI Negotiator", icon: Bot }
  
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">F</div>
        <div>
          <h2>FabricSave</h2>
          <span>AI PROCUREMENT</span>
        </div>
      </div>

      <p className="nav-label">WORKSPACE</p>

      <nav>
        {items.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onNavigate(label)}
            className={`nav-item ${active === label ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">SK</div>
        <div>
          <strong>Fabric Buyer</strong>
          <small>Procurement Team</small>
        </div>
      </div>
    </aside>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Package,
  Users,
  TrendingDown,
  Plus,
  Sparkles,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  Search,
  ChevronRight,
  Target,
  ShoppingCart
} from "lucide-react";

import Auth from "./components/Auth.jsx";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import SupplierTable from "./components/SupplierTable";
import QuoteComparison from "./components/QuoteComparison";
import FabricForm from "./components/FabricForm";
import NegotiationChat from "./components/NegotiationChat";
import { getQuotes, askAgent } from "./services/api";
import "./index.css";

const money = value =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const getTotal = (quote, quantity = quote.quantity) =>
  Number(quote.price_per_metre) * Number(quantity) +
  Number(quote.freight || 0) +
  Number(quote.tax || 0);

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fabricsave_user")) || null;
    } catch {
      return null;
    }
  });

  const [active, setActive] = useState("Dashboard");
  const [quotes, setQuotes] = useState([]);
  const [requirement, setRequirement] = useState({
    fabric_type: "Cotton",
    gsm: 180,
    quantity: 10000,
    target_price: 85
  });
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  function handleLogin(userData) {
    localStorage.setItem("fabricsave_user", JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("fabricsave_user");
    setUser(null);
    setActive("Dashboard");
  }

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    getQuotes()
      .then(data => {
        if (!cancelled) {
          setQuotes(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotice("Could not load supplier quotations.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredQuotes = useMemo(() => {
    const query = search.toLowerCase();

    return quotes.filter(q =>
      String(q.fabric_type || "").toLowerCase().includes(query) ||
      String(q.supplier_name || q.name || "").toLowerCase().includes(query)
    );
  }, [quotes, search]);

  const compatible = useMemo(() => {
    return quotes
      .filter(q =>
        String(q.fabric_type || "").toLowerCase() ===
          String(requirement.fabric_type).toLowerCase() &&
        Number(q.gsm) === Number(requirement.gsm) &&
        Number(q.quantity) >= Number(requirement.quantity)
      )
      .sort(
        (a, b) =>
          getTotal(a, requirement.quantity) -
          getTotal(b, requirement.quantity)
      );
  }, [quotes, requirement]);

  const best = compatible[0] || null;

  // Estimated comparison against the buyer's target unit price.
  const potentialSavings = best
    ? Math.max(
        0,
        Number(best.price_per_metre) -
          Number(requirement.target_price)
      ) * Number(requirement.quantity)
    : 0;

  const supplierCount = new Set(
    quotes.map(q => q.supplier_id || q.supplier_name || q.id)
  ).size;

  async function handleAsk(message) {
    const reply = await askAgent(
      message,
      compatible.length ? compatible : quotes,
      requirement
    );

    setHistory(previous => [
      {
        question: message,
        reply,
        date: new Date().toLocaleString()
      },
      ...previous
    ]);

    return reply;
  }

  function saveRequirement(form) {
    setRequirement(form);
    setNotice("Fabric requirements updated successfully.");
    setActive("Dashboard");
  }

  function renderPage() {
    if (active === "Procurement") {
      return (
        <>
       
        </>
      );
    }

    if (active === "Suppliers") {
      return (
        <>
          <PageHeading
            eyebrow="SOURCING NETWORK"
            title="Supplier directory"
            description="Review suppliers and compare their current sample quotations."
          />

          <section className="modern-panel">
            <div className="toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search suppliers or fabric..."
                />
              </div>
              <span className="result-count">
                {filteredQuotes.length} quotations
              </span>
            </div>

            {loading ? (
              <Loading />
            ) : (
              <SupplierTable quotes={filteredQuotes} />
            )}
          </section>
        </>
      );
    }

    if (active === "Quote Comparison") {
      return (
        <>
         

          <div className="modern-panel requirements-strip">
            <div>
              <span className="muted">Current requirement</span>
              <strong>
                {requirement.fabric_type} · {requirement.gsm} GSM
              </strong>
            </div>
            <div>
              <span className="muted">Quantity</span>
              <strong>
                {Number(requirement.quantity).toLocaleString("en-IN")} metres
              </strong>
            </div>
            <div>
              <span className="muted">Target price</span>
              <strong>{money(requirement.target_price)}/m</strong>
            </div>
            <button
              className="modern-button secondary-button"
              onClick={() => setActive("Procurement")}
            >
              Edit requirements
            </button>
          </div>

          {compatible.length === 0 ? (
            <section className="modern-panel empty-state">
              <Package size={32} />
              <h3>No matching quotations found</h3>
              <p>
                Try another fabric type or GSM, or reduce the required quantity.
              </p>
              <button
                className="modern-button primary-button"
                onClick={() => setActive("Procurement")}
              >
                Change requirements
              </button>
            </section>
          ) : (
            <>
              <section className="modern-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Best available offers</h3>
                    <p className="muted">
                      Ranked by landed cost for the requested quantity.
                    </p>
                  </div>
                  <span className="status-pill">
                    <CheckCircle2 size={13} /> Comparable specs
                  </span>
                </div>
                <QuoteComparison quotes={compatible} />
              </section>

              <section className="modern-panel">
                <h3>Detailed quotation breakdown</h3>
                <p className="muted">
                  Compare fabric cost, freight, and total cost before deciding.
                </p>
                <SupplierTable quotes={compatible} />
              </section>
            </>
          )}
        </>
      );
    }

    if (active === "AI Negotiator") {
      return (
        <>
          <PageHeading
            eyebrow="AI PROCUREMENT ASSISTANT"
            title="Negotiation workspace"
            description="Analyze offers, choose a target, and draft a professional counteroffer."
          />

          <div className="modern-grid negotiation-layout">
            <NegotiationChat onAsk={handleAsk} />

            <aside className="modern-panel negotiation-aside">
              <div className="panel-icon">
                <Target size={20} />
              </div>
              <h3>Negotiation brief</h3>
              <p className="muted">Based on your current requirements.</p>

              <div className="target-card">
                <span>Buyer target</span>
                <strong>
                  {money(requirement.target_price)}
                  <small>/m</small>
                </strong>
              </div>

              {best && (
                <>
                  <div className="detail-row">
                    <span>Lowest quoted rate</span>
                    <strong>{money(best.price_per_metre)}/m</strong>
                  </div>
                  <div className="detail-row">
                    <span>Quoted landed cost</span>
                    <strong>
                      {money(getTotal(best, requirement.quantity))}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Supplier</span>
                    <strong>{best.supplier_name || best.name}</strong>
                  </div>
                </>
              )}

              <button
                className="modern-button primary-button full-width"
                onClick={() =>
                  handleAsk(
                    "Generate a professional counteroffer based on my target price."
                  )
                }
              >
                <Sparkles size={16} /> Generate counteroffer
              </button>

              <p className="small-note">
                All counteroffers are drafts. Review and approve them before sending.
              </p>
            </aside>
          </div>
        </>
      );
    }

    if (active === "Negotiation History") {
      return (
        <>
          <PageHeading
            eyebrow="ACTIVITY LOG"
            title="Negotiation history"
            description="Review AI recommendations generated during this session."
          />

          {history.length === 0 ? (
            <section className="modern-panel empty-state">
              <Clock3 size={32} />
              <h3>No conversations yet</h3>
              <p>
                Your AI conversations will appear here after you start negotiating.
              </p>
              <button
                className="modern-button primary-button"
                onClick={() => setActive("AI Negotiator")}
              >
                Start negotiating
              </button>
            </section>
          ) : (
            <section className="modern-panel">
              {history.map((item, index) => (
                <article
                  className="history-entry"
                  key={`${item.date}-${index}`}
                >
                  <span className="muted">{item.date}</span>
                  <h3>{item.question}</h3>
                  <p>{item.reply}</p>
                </article>
              ))}
            </section>
          )}
        </>
      );
    }

    return (
      <>
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">YOUR PROCUREMENT OVERVIEW</span>
            <h1>Buy smarter. Save more.</h1>
            <p>
              Make data-driven fabric purchasing decisions with your AI assistant.
            </p>
          </div>

          <button
            className="modern-button primary-button"
            onClick={() => setActive("Procurement")}
          >
            <Plus size={17} /> New requirement
          </button>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Suppliers"
            value={supplierCount}
            subtitle="In sample quotation data"
            icon={<Users size={19} />}
          />
          <StatCard
            title="Quotations"
            value={quotes.length}
            subtitle="Available to compare"
            icon={<Package size={19} />}
          />
          <StatCard
            title="Best landed cost"
            value={best ? money(getTotal(best, requirement.quantity)) : "—"}
            subtitle={best ? best.supplier_name : "No matching quote"}
            icon={<IndianRupee size={19} />}
          />
          <StatCard
            title="Potential savings"
            value={money(potentialSavings)}
            subtitle="Target-rate comparison"
            icon={<TrendingDown size={19} />}
          />
        </div>

        <div className="modern-grid dashboard-grid">
          

          <section className="modern-panel ai-card">
            <div className="ai-orb">
              <Sparkles size={24} />
            </div>
            <span className="eyebrow">MEET YOUR AI NEGOTIATOR</span>
            <h2>Better deals start with better questions.</h2>
            <p>
              Compare supplier offers, explore negotiation targets, and draft
              professional counteroffers in seconds.
            </p>
            <button
              className="modern-button primary-button full-width"
              onClick={() => setActive("AI Negotiator")}
            >
              Open AI negotiator <ChevronRight size={16} />
            </button>
          </section>
        </div>

        

        <section className="bottom-insight">
          <div className="insight-icon">
            <Target size={19} />
          </div>
          <div>
            <strong>Procurement tip</strong>
            <p>
              Compare landed cost, fabric specifications, quality, and delivery
              together. The lowest unit price is not always the best deal.
            </p>
          </div>
        </section>
      </>
    );
  }

  // Show login/signup before rendering the dashboard.
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />

      <main className="main-content improved-main">
        <header className="topbar improved-topbar">
          <div className="breadcrumb">
            <span>FabricSave AI</span>
            <ChevronRight size={14} />
            <strong>{active}</strong>
          </div>

          <div className="topbar-right">
            <span className="demo-badge">
              <span /> DEMO MODE
            </span>
            <span className="user-email">{user.email}</span>
            <button
              className="modern-button secondary-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {notice && (
          <div className="notice improved-notice">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {renderPage()}

        <footer className="improved-footer">
          <span>FabricSave AI</span>
          <span>Smarter fabric procurement · Demo data only</span>
        </footer>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}



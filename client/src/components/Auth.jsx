
import { useState } from "react";
import { LockKeyhole, Mail, User, Leaf } from "lucide-react";

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isSignup && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Demo-only authentication; replace with a backend API for real accounts.
    onLogin({ name: isSignup ? name : email.split("@")[0], email });
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo"><Leaf size={25} /></div>
        <h1>FabricSave AI</h1>
        <p className="auth-subtitle">
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {isSignup && (
          <label className="auth-field">
            <span>Name</span>
            <div><User size={18} />
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" autoComplete="name" />
            </div>
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <div><Mail size={18} />
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required />
          </div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div><LockKeyhole size={18} />
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required minLength={6} />
          </div>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-submit" type="submit">
          {isSignup ? "Create account" : "Log in"}
        </button>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to FabricSave AI?"}
          <button type="button" onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
}

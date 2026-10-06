import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "../components/Icons";
import { toast } from "../lib/toast";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { login, apiErrorMessage } from "../lib/api";
import { setSession } from "../lib/session";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("sessionExpired") === "1";
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(sessionExpired ? "Your session expired. Please log in again." : "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      setSession(response);
      toast.success(`Welcome back, ${response.fullName.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see who's heading your way this morning."
      footer={
        <>
          New to one23? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form className="stack" onSubmit={handleSubmit}>
        {error ? (
          <p role="alert" aria-live="polite" className="alert">
            {error}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="email" className="label">
            Email
          </label>
          <div className="field-wrap">
            <span className="field-icon">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-lg input-icon"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="field-wrap">
            <span className="field-icon">
              <Lock size={18} />
            </span>
            <Input
              id="password"
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-lg input-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="field-toggle"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="lime" size="xl" className="btn-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"} <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}

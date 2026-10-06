import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "../components/Icons";
import { toast } from "../lib/toast";
import { AuthShell } from "../components/AuthShell";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { signup, login, apiErrorMessage, apiFieldErrors } from "../lib/api";
import { setSession } from "../lib/session";

export function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await signup({ fullName, email, password });
      const session = await login({ email, password });
      setSession(session);
      toast.success("Account created — let's find your first ride");
      navigate("/dashboard");
    } catch (err) {
      setFieldErrors(apiFieldErrors(err));
      setError(apiErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes now, a cheaper commute from tomorrow."
      footer={
        <>
          Already riding with us? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="stack" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p role="alert" aria-live="polite" className="alert">
            {error}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="fullName" className="label">
            Full name
          </label>
          <Input
            id="fullName"
            required
            placeholder="Priya Nair"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName)}
            className="input-lg"
          />
          {fieldErrors.fullName ? <p className="field-error">{fieldErrors.fullName}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="email" className="label">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className="input-lg"
          />
          {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="password" className="label">
            Password
          </label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            className="input-lg"
          />
          {fieldErrors.password ? (
            <p className="field-error">{fieldErrors.password}</p>
          ) : (
            <p className="hint">Must be at least 8 characters.</p>
          )}
        </div>

        <Button type="submit" variant="lime" size="xl" className="btn-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"} <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}

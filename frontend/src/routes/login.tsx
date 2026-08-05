import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, apiErrorMessage } from "@/lib/api";
import { setSession } from "@/lib/session";

type LoginSearch = { sessionExpired?: boolean };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    search["sessionExpired"] === "1" ? { sessionExpired: true } : {},
  head: () => ({
    meta: [
      { title: "Log in — one23" },
      {
        name: "description",
        content: "Log in to one23 to join a ride, track your group, and chat with your commute.",
      },
      { property: "og:title", content: "Log in — one23" },
      { property: "og:description", content: "Access your one23 commuting account." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { sessionExpired } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    sessionExpired ? "Your session expired. Please log in again." : "",
  );
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      setSession(response);
      toast.success(`Welcome back, ${response.fullName.split(" ")[0]}`);
      await navigate({ to: "/dashboard" });
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
          New to one23?{" "}
          <Link to="/signup" className="font-semibold text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error ? (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl px-11 text-base"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="lime" size="xl" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"} <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}

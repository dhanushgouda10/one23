import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, login, apiErrorMessage, apiFieldErrors } from "@/lib/api";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your one23 account" },
      {
        name: "description",
        content:
          "Sign up with your work email and start sharing your daily office commute in Bengaluru.",
      },
      { property: "og:title", content: "Create your one23 account" },
      { property: "og:description", content: "Join office commuters sharing routes on one23." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await signup({ fullName, email, password });

      // Backend signup doesn't return a token, so log in right after with
      // the same credentials for a one-step signup experience.
      const session = await login({ email, password });
      setSession(session);
      toast.success("Account created — let's find your first ride");
      await navigate({ to: "/dashboard" });
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
          Already riding with us?{" "}
          <Link to="/login" className="font-semibold text-foreground underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
          <Label htmlFor="fullName" className="text-sm">
            Full name
          </Label>
          <Input
            id="fullName"
            required
            placeholder="Priya Nair"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={Boolean(fieldErrors["fullName"])}
            className="h-14 rounded-2xl text-base"
          />
          {fieldErrors["fullName"] ? (
            <p className="text-xs text-destructive">{fieldErrors["fullName"]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors["email"])}
            className="h-14 rounded-2xl text-base"
          />
          {fieldErrors["email"] ? (
            <p className="text-xs text-destructive">{fieldErrors["email"]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors["password"])}
            className="h-14 rounded-2xl text-base"
          />
          {fieldErrors["password"] ? (
            <p className="text-xs text-destructive">{fieldErrors["password"]}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
          )}
        </div>

        <Button type="submit" variant="lime" size="xl" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"} <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}

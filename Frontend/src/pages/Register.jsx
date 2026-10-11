import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthCard from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

// Mirrors validators/authValidator.js -> registerSchema
function validate({ name, email, password }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (name.trim().length > 50) errors.name = "Name must not exceed 50 characters";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Please provide a valid email address";
  if (password.length < 6) errors.password = "Password must be at least 6 characters";
  if (password.length > 100) errors.password = "Password must not exceed 100 characters";
  return errors;
}

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setErrors(Object.fromEntries((err.errors || []).map((x) => [x.field, x.message])));
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const field = (name, label, type = "text", autoComplete) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} value={form[name]} onChange={set(name)} autoComplete={autoComplete} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <AuthCard title="Create an account" description="Start tracking your income and expenses.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {field("name", "Name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

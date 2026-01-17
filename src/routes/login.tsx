import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginPage } from "@/components/LoginPage";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  // Show nothing while checking auth status
  if (loading) {
    return null;
  }

  // Already logged in, will redirect
  if (user) {
    return null;
  }

  return (
    <LoginPage
      onLoginSuccess={() => navigate({ to: "/dashboard" })}
      onBack={() => navigate({ to: "/" })}
    />
  );
}

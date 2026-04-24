"use client";

import { type FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/create");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3f0",
        padding: "20px 16px",
        fontFamily: "sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 25 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🔐</div>

          <h1
            style={{
              fontSize: 24,
              color: "#8b5e4c",
              margin: 0,
            }}
          >
            Giriş Yap
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              marginTop: 8,
            }}
          >
            Event paneline erişmek için giriş yap
          </p>
        </div>

        <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "2px solid black",
  background: "white",
  color: "black",
  outline: "none",
  fontSize: 14,
          }}
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
 width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "2px solid black",
  background: "white",
  color: "black",
  outline: "none",
  fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16,
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #c08457, #b08968)",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(176,137,104,0.3)",
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
        </form>
      </div>
    </div>
  );
}

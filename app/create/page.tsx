"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";

type CreatedEvent = {
  slug: string;
};

export default function CreatePage() {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) router.push("/login");
      else setCheckingAuth(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.push("/login");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const createEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !title) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const slug = slugify(title, {
        lower: true,
        strict: true,
      });

      const { data, error } = await supabase
        .from("events")
        .insert([{ title, slug, user_id: user?.id }])
        .select()
        .single();

      if (error) {
        alert("Hata: " + error.message);
        return;
      }

      setCreatedEvent(data);
      setTitle("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      alert("Unexpected error: " + message);
    } finally {
      setLoading(false);
    }
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://event-qr-app.vercel.app";

  const eventUrl = createdEvent ? `${baseUrl}/e/${createdEvent.slug}` : "";

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !createdEvent) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${createdEvent.slug}-qr.png`;
      a.click();
    };

    img.src = url;
  };

  if (checkingAuth) {
    return <div style={{ padding: 20 }}>Kontrol ediliyor...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3f0",
        padding: "8px 16px 24px",
        fontFamily: "sans-serif",
      }}
    >
      {/* TOP NAV */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
          position: "sticky",
          top: 8,
          zIndex: 20,
          background: "rgba(247, 243, 240, 0.92)",
          backdropFilter: "blur(8px)",
          padding: "6px 0",
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d6d3d1",
            background: "white",
            color: "#6b4f4f",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          📊 Event Listesi
        </button>

        <button
          onClick={logout}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d6d3d1",
            background: "white",
            color: "#6b4f4f",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Çıkış
        </button>
      </div>

      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: "white",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            textAlign: "center",
            color: "#8b5e4c",
            marginBottom: 10,
            marginTop: 0,
          }}
        >
          🎉 Event Oluştur
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 18,
          }}
        >
          Yeni bir etkinlik oluştur ve QR ile paylaş
        </p>

        <form onSubmit={createEvent}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Cem & Ayşe Wedding"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "2px solid #374151",
              background: "white",
              color: "black",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 15,
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
            {loading ? "Oluşturuluyor..." : "Event Oluştur"}
          </button>
        </form>

        {createdEvent && (
          <div style={{ marginTop: 25, textAlign: "center" }}>
            <h3 style={{ color: "#16a34a" }}>✅ Event Hazır</h3>

            <p style={{ fontSize: 12, marginTop: 10, color: "#6b7280" }}>
              Link:
            </p>

            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: 14,
                borderRadius: 12,
                border: "2px solid black",
                background: "white",
                color: "black",
                outline: "none",
                fontSize: 14,
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {eventUrl}
            </a>

            <div
              ref={qrRef}
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <QRCode value={eventUrl} />
            </div>

            <button
              onClick={downloadQr}
              style={{
                marginTop: 15,
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #c08457, #b08968)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              QR Kodunu İndir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
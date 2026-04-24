"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://event-qr-app.vercel.app";

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) console.log(error);

      setEvents(data || []);
      setLoading(false);
    };

    load();
  }, [router]);

  const deleteEvent = async (id: string) => {
    const confirmDelete = window.confirm("Bu eventi silmek istediğine emin misin?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert("Silme hatası: " + error.message);
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const downloadQr = (slug: string) => {
    const eventUrl = `${baseUrl}/e/${slug}`;

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    document.body.appendChild(tempDiv);

    const svgWrapper = document.createElement("div");
    tempDiv.appendChild(svgWrapper);

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(svgWrapper);

      root.render(<QRCode value={eventUrl} size={512} />);

      setTimeout(() => {
        const svg = svgWrapper.querySelector("svg");
        if (!svg) {
          root.unmount();
          tempDiv.remove();
          return;
        }

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
          a.download = `${slug}-qr.png`;
          a.click();

          root.unmount();
          tempDiv.remove();
        };

        img.src = url;
      }, 100);
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f3f0",
          padding: 20,
          color: "#8b5e4c",
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3f0",
        padding: "20px 16px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#8b5e4c", fontSize: 26 }}>
              📊 Event Paneli
            </h1>

            <p style={{ marginTop: 6, color: "#6b7280", fontSize: 14 }}>
              Oluşturduğun eventleri buradan yönet
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #d6d3d1",
              background: "white",
              color: "#6b4f4f",
              cursor: "pointer",
            }}
          >
            Çıkış
          </button>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: 22,
          }}
        >
          <h2 style={{ margin: 0, color: "#6b4f4f", fontSize: 18 }}>
            Yeni Event Oluştur
          </h2>

          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
            Yeni bir QR etkinliği oluşturup misafirlerinle paylaş.
          </p>

          <button
            onClick={() => router.push("/create")}
            style={{
              marginTop: 14,
              padding: 14,
              width: "100%",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #c08457, #b08968)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 5px 15px rgba(176,137,104,0.3)",
            }}
          >
            + Event Oluştur
          </button>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ margin: 0, color: "#6b4f4f", fontSize: 18 }}>
            Event Listesi
          </h2>

          {events.length === 0 && (
            <p style={{ color: "#9ca3af", marginTop: 14 }}>Henüz event yok.</p>
          )}

          <div style={{ marginTop: 14 }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  border: "1px solid #d6d3d1",
                  background: "#fffaf8",
                  padding: 14,
                  borderRadius: 16,
                  marginTop: 12,
                }}
              >
                <h3 style={{ margin: 0, color: "#6b4f4f", fontSize: 17 }}>
                  {event.title}
                </h3>

                <p
                  style={{
                    fontSize: 12,
                    color: "#8b5e4c",
                    marginTop: 6,
                    wordBreak: "break-all",
                  }}
                >
                  /e/{event.slug}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={() => router.push(`/e/${event.slug}`)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #d6d3d1",
                      background: "white",
                      cursor: "pointer",
                      color: "#6b4f4f",
                      fontWeight: 600,
                    }}
                  >
                    Gör
                  </button>

                  <button
                    onClick={() => downloadQr(event.slug)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #d6d3d1",
                      background: "white",
                      cursor: "pointer",
                      color: "#6b4f4f",
                      fontWeight: 600,
                    }}
                  >
                    QR İndir
                  </button>

                  <button
                    onClick={() => deleteEvent(event.id)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #fecaca",
                      background: "#fff1f2",
                      cursor: "pointer",
                      color: "#dc2626",
                      fontWeight: 600,
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
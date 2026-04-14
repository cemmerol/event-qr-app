"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import slugify from "slugify";
import QRCode from "react-qr-code";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  const createEvent = async () => {
    if (!title) return;

    setLoading(true);

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    const { data, error } = await supabase
      .from("events")
      .insert([{ title, slug }])
      .select()
      .single();

    if (error) {
      alert("Hata: " + error.message);
      setLoading(false);
      return;
    }

    setCreatedEvent(data);
    setTitle("");
    setLoading(false);
  };

  // 🚀 PRODUCTION SAFE BASE URL
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://event-qr-app.vercel.app";

  const eventUrl = createdEvent
    ? `${baseUrl}/e/${createdEvent.slug}`
    : "";

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Create Event 🎉</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event adı (örn: Cem's Wedding)"
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10,
        }}
      />

      <button
        onClick={createEvent}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: 10,
          width: "100%",
        }}
      >
        {loading ? "Oluşturuluyor..." : "Event Oluştur"}
      </button>

      {createdEvent && (
        <div style={{ marginTop: 30 }}>
          <h2>Event hazır 🎯</h2>

          <p>
            Link:
            <br />
            <code>{eventUrl}</code>
          </p>

          <div style={{ marginTop: 20 }}>
            <QRCode value={eventUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
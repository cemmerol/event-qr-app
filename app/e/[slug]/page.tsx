"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import UploadSection from "./UploadSection";
import Gallery from "./Gallery";

export default function EventPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!eventData) return;

    setEvent(eventData);

    const { data: mediaData } = await supabase
      .from("media")
      .select("*")
      .eq("event_id", eventData.uuid)
      .order("created_at", { ascending: false });

    setMedia(mediaData || []);
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (!event) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3f0",
        padding: "20px 16px 40px",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#8b5e4c",
            marginBottom: 10,
          }}
        >
          {event.title}
        </h1>

        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#3f3f3f",
            marginBottom: 10,
          }}
        >
          Anılarını Bizimle Paylaş
        </p>

        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          Bu özel günden yakaladığın kareleri <br />
          yükleyerek hikayemize ortak ol ✨
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div
        style={{
          marginTop: 25,
          background: "#fff",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <UploadSection
          eventId={event.uuid}
          onUpload={(newItem) => {
            setMedia((prev) => [newItem, ...prev]);
          }}
        />
      </div>

      {/* GALLERY */}
      <div style={{ marginTop: 40 }}>
        <h3
          style={{
            fontSize: 18,
            marginBottom: 15,
            color: "#8b5e4c",
            fontWeight: 600,
          }}
        >
          📸 Anılar
        </h3>

        <Gallery media={media} />
      </div>
    </div>
  );
}
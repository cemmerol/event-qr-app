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
    if (slug) fetchData();
  }, [slug]);

  if (!event) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/floral-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        padding: "34px 18px 50px",
        fontFamily: "sans-serif",
      }}
    >
      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        {/* HERO */}
        <section
          style={{
            textAlign: "center",
            paddingTop: 70,
            paddingBottom: 38,
          }}
        >
          <h1
            style={{
              fontSize: 46,
              fontWeight: 500,
              color: "#4b342d",
              margin: 0,
              lineHeight: 1.05,
              fontFamily: "Georgia, serif",
              textShadow: "0 2px 10px rgba(255,255,255,0.7)",
            }}
          >
            {event.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              margin: "22px 0",
              color: "#b08968",
            }}
          >
            <span
              style={{
                width: 60,
                height: 1,
                background: "#c9a493",
              }}
            />
            <span style={{ fontSize: 18 }}>♡</span>
            <span
              style={{
                width: 60,
                height: 1,
                background: "#c9a493",
              }}
            />
          </div>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#a46f60",
              margin: 0,
              fontFamily: "Georgia, serif",
              textShadow: "0 2px 8px rgba(255,255,255,0.8)",
            }}
          >
            Anılarını Bizimle Paylaş
          </h2>

          <p
            style={{
              fontSize: 17,
              color: "#3f302b",
              lineHeight: 1.7,
              marginTop: 14,
              textShadow: "0 2px 8px rgba(255,255,255,0.85)",
              fontWeight: 500,
            }}
          >
            Bu özel günden yakaladığın kareleri <br />
            yükleyerek hikayemize ortak ol ✨
          </p>
        </section>

        {/* UPLOAD AREA */}
        <section
          style={{
            marginTop: 18,
          }}
        >
          <UploadSection
            eventId={event.uuid}
            onUpload={(newItem) => {
              setMedia((prev) => [newItem, ...prev]);
            }}
          />
        </section>

        {/* GALLERY */}
        <section
          style={{
            marginTop: 28,
            background: "rgba(255, 248, 243, 0.78)",
            borderRadius: 20,
            padding: 18,
            boxShadow: "0 12px 30px rgba(95,74,66,0.12)",
            border: "1px solid rgba(190,145,123,0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                color: "#a46f60",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 48,
                  height: 1,
                  background: "#c9a493",
                }}
              />
              <span style={{ fontSize: 20 }}>📷</span>
              <span
                style={{
                  width: 48,
                  height: 1,
                  background: "#c9a493",
                }}
              />
            </div>

            <h3
              style={{
                fontSize: 26,
                margin: 0,
                color: "#6b4f4f",
                fontWeight: 600,
                fontFamily: "Georgia, serif",
              }}
            >
              Anılar
            </h3>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 14,
                color: "#6f625c",
              }}
            >
              Bu özel günden paylaşılan kareler
            </p>

            <div
              style={{
                display: "inline-block",
                marginTop: 10,
                fontSize: 12,
                color: "#8b5e4c",
                background: "#fff4ef",
                border: "1px solid #eadbd3",
                borderRadius: 999,
                padding: "6px 12px",
              }}
            >
              {media.length} medya
            </div>
          </div>

          <Gallery media={media} />
        </section>
      </main>
    </div>
  );
}
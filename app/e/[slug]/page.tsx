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
    <div style={{ padding: 20 }}>
      <h1>🎉 {event.title}</h1>

      <UploadSection
        eventId={event.uuid}
        onUpload={(newItem) => {
          setMedia((prev) => [newItem, ...prev]);
        }}
      />

      <div style={{ marginTop: 30 }}>
        <h3>📸 Gallery</h3>
        <Gallery media={media} />
      </div>
    </div>
  );
}
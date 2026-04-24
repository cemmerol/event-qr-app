"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadSection({
  eventId,
  onUpload,
}: {
  eventId: string;
  onUpload?: (item: any) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${eventId}/${crypto.randomUUID()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(data.path);

        const publicUrl = publicUrlData.publicUrl;

        await supabase.from("media").insert({
          event_id: eventId,
          url: publicUrl,
          type: file.type.startsWith("video") ? "video" : "image",
        });

        onUpload?.({
          id: crypto.randomUUID(),
          url: publicUrl,
          type: file.type.startsWith("video") ? "video" : "image",
        });
      }

      setFiles([]);
    } catch (err) {
      console.log(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* FOTOĞRAF YÜKLE CARD */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          width: "100%",
          padding: "22px 24px",
          borderRadius: 18,
          background: "linear-gradient(135deg, #b98570, #a9725f)",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 12px 28px rgba(95,74,66,0.22)",
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div
          style={{
            width: 66,
            height: 66,
            minWidth: 66,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9b6a58",
            fontSize: 31,
            boxShadow: "0 6px 16px rgba(95,74,66,0.12)",
          }}
        >
          📷
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.2px",
            }}
          >
            Fotoğraf Yükle
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {files.length > 0
              ? `${files.length} dosya seçildi`
              : "Fotoğraf veya video seç"}
          </div>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1,
            opacity: 0.95,
          }}
        >
          ›
        </div>
      </label>

      {/* SEÇİLEN DOSYALAR */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            background: "rgba(255,248,243,0.78)",
            border: "1px solid rgba(190,145,123,0.35)",
            color: "#6b4f4f",
            fontSize: 13,
            boxShadow: "0 8px 20px rgba(95,74,66,0.08)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Seçilen dosyalar
          </div>

          {files.slice(0, 5).map((f, i) => (
            <div key={i} style={{ marginTop: 4 }}>
              • {f.name}
            </div>
          ))}

          {files.length > 5 && (
            <div style={{ marginTop: 6, color: "#8b7a72" }}>
              +{files.length - 5} dosya daha
            </div>
          )}
        </div>
      )}

      {/* GÖNDER BUTONU */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || loading}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 15,
          borderRadius: 16,
          border: "none",
          background:
            files.length > 0
              ? "linear-gradient(135deg, #b98570, #a9725f)"
              : "rgba(185,133,112,0.35)",
          color: "white",
          fontWeight: 600,
          cursor: files.length > 0 ? "pointer" : "not-allowed",
          boxShadow:
            files.length > 0
              ? "0 10px 22px rgba(95,74,66,0.18)"
              : "none",
        }}
      >
        {loading ? "Yükleniyor..." : "Fotoğrafları Gönder"}
      </button>
    </div>
  );
}
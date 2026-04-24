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

        const newItem = {
          id: crypto.randomUUID(),
          url: publicUrl,
          type: file.type.startsWith("video") ? "video" : "image",
        };

        onUpload?.(newItem);
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
      {/* 📦 UPLOAD BOX */}
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #e5d5cf",
          borderRadius: 20,
          padding: 30,
          cursor: "pointer",
          background: "#fffaf8",
          textAlign: "center",
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* 📸 ICON */}
        <div
          style={{
            fontSize: 40,
            marginBottom: 10,
            color: "#b08968",
          }}
        >
          📷
        </div>

        {/* TEXT */}
        {files.length > 0 ? (
          <div style={{ color: "#6b4f4f", fontWeight: 500 }}>
            {files.length} dosya seçildi
          </div>
        ) : (
          <>
            <div
              style={{
                fontWeight: 600,
                color: "#6b4f4f",
                marginBottom: 4,
              }}
            >
              Dosya Yükle
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#a8a29e",
              }}
            >
              Fotoğrafları seç veya sürükle
            </div>
          </>
        )}
      </label>

      {/* 📄 FILE LIST */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#7c6f64",
          }}
        >
          {files.map((f, i) => (
            <div key={i}>• {f.name}</div>
          ))}
        </div>
      )}

      {/* 🚀 UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || loading}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "none",
          background:
            files.length > 0
              ? "linear-gradient(135deg, #c08457, #b08968)"
              : "#e5e7eb",
          color: "white",
          fontWeight: 600,
          cursor: files.length > 0 ? "pointer" : "not-allowed",
          boxShadow:
            files.length > 0
              ? "0 5px 15px rgba(176,137,104,0.3)"
              : "none",
        }}
      >
        {loading ? "Yükleniyor..." : "Fotoğrafları Gönder"}
      </button>
    </div>
  );
}
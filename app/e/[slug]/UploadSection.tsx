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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${eventId}/${crypto.randomUUID()}.${fileExt}`;

      // storage upload
      const { data, error } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (error) throw error;

      // public url
      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData.publicUrl;

      // db insert
      await supabase.from("media").insert({
        event_id: eventId,
        url: publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
      });

      // 🔥 REALTIME UI UPDATE
      const newItem = {
        id: crypto.randomUUID(),
        url: publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
      };

      onUpload?.(newItem);

      setFile(null);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10 }}>📤 Upload Media</h3>

      {/* FILE SELECT */}
      <label
        style={{
          display: "block",
          border: "2px dashed #d1d5db",
          padding: 16,
          borderRadius: 12,
          textAlign: "center",
          cursor: "pointer",
          background: "#fafafa",
          color: "#6b7280",
        }}
      >
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {file ? (
          <span style={{ color: "#111", fontWeight: 500 }}>
            📎 {file.name}
          </span>
        ) : (
          <span>📱 Fotoğraf / Video seçmek için tıkla</span>
        )}
      </label>

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "none",
          background: file ? "#111" : "#d1d5db",
          color: "white",
          cursor: file ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
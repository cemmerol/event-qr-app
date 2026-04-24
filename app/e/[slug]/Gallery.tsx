"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Gallery({ media }: { media: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  let startX = 0;

  if (!media || media.length === 0) {
    return (
      <div style={{ marginTop: 10, color: "#a8a29e", textAlign: "center" }}>
        📭 Henüz medya yok
      </div>
    );
  }

  const next = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev! < media.length - 1 ? prev! + 1 : prev
    );
  };

  const prev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev! > 0 ? prev! - 1 : prev
    );
  };

  const downloadAll = async () => {
    const ok = confirm(
      `Tüm fotoğraflar indirilecek (${media.length} adet). Devam etmek istiyor musun?`
    );

    if (!ok) return;

    const zip = new JSZip();

    const images = media.filter((m) =>
      m.type?.startsWith("image")
    );

    for (let i = 0; i < images.length; i++) {
      const item = images[i];

      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        zip.file(`photo-${i + 1}.jpg`, blob);
      } catch (err) {
        console.log("Download error:", err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "event-photos.zip");
  };

  return (
    <>
      {/* 📥 DOWNLOAD BUTTON */}
      <button
        onClick={downloadAll}
        style={{
          marginBottom: 15,
          padding: 12,
          width: "100%",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #c08457, #b08968)",
          color: "white",
          fontWeight: 600,
          boxShadow: "0 5px 15px rgba(176,137,104,0.3)",
          cursor: "pointer",
        }}
      >
        📥 Tüm Fotoğrafları İndir
      </button>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {media.map((item, index) => (
          <div
            key={item.id}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            {item.type?.startsWith("video") ? (
              <video width="100%" controls>
                <source src={item.url} />
              </video>
            ) : (
              <img
                src={item.url}
                onClick={() => setSelectedIndex(index)}
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  transition: "0.3s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          onTouchStart={(e) => (startX = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) next();
            if (endX - startX > 50) prev();
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <img
            src={media[selectedIndex].url}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 14,
            }}
          />

          {/* 📊 SAYAC */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              color: "white",
              fontSize: 13,
              background: "rgba(0,0,0,0.4)",
              padding: "6px 12px",
              borderRadius: 12,
            }}
          >
            {selectedIndex + 1} / {media.length}
          </div>

          {/* ⬅️ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ◀
          </button>

          {/* ➡️ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 28,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ▶
          </button>

          {/* ❌ CLOSE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              fontSize: 22,
              color: "white",
              background: "rgba(0,0,0,0.4)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
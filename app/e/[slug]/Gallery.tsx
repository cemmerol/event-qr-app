export default function Gallery({ media }: { media: any[] }) {
  if (!media || media.length === 0) {
    return (
      <div style={{ marginTop: 10, color: "#6b7280" }}>
        📭 Henüz medya yok
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 10,
      }}
    >
      {media.map((item) => (
        <div
          key={item.id}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          {item.type?.startsWith("video") ? (
            <video width="100%" controls>
              <source src={item.url} />
            </video>
          ) : (
            <img
              src={item.url}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import slugify from "slugify"
import QRCode from "react-qr-code"

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [createdEvent, setCreatedEvent] = useState<any>(null)

  const createEvent = async () => {
    if (!title) return

    setLoading(true)

    // 🔥 slug üret
    const slug = slugify(title, {
      lower: true,
      strict: true,
    })

    // 🔥 DB insert
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          title,
          slug,
        },
      ])
      .select()
      .single()

    if (error) {
      alert("Hata: " + error.message)
      setLoading(false)
      return
    }

    // başarı
    setCreatedEvent(data)
    setTitle("")
    setLoading(false)
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>🎉 Event Oluştur</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Örn: Alis Day"
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

      {/* 🔥 Event oluşturulduktan sonra */}
      {createdEvent && (
        <div style={{ marginTop: 30 }}>
          <h2>✅ Event Hazır</h2>

          <p>
            Link:
            <br />
            <code>
              {`http://localhost:3000/e/${createdEvent.slug}`}
            </code>
          </p>

          <div style={{ marginTop: 20 }}>
            <QRCode
              value={`http://localhost:3000/e/${createdEvent.slug}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
import { supabase } from "@/lib/supabase"

export default async function TestPage() {
  const { data, error } = await supabase
    .from("events")
    .select("*")

  if (error) {
    return <div>Hata: {error.message}</div>
  }

  return (
    <div>
      <h1>Events</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
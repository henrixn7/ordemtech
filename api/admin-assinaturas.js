import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const adminEmail = req.headers["x-admin-email"]

    if (adminEmail !== "henriyurifortt@gmail.com") {
      return res.status(401).json({
        error: "Sem permissão",
      })
    }

    const { data, error } = await supabaseAdmin
      .from("assinaturas")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.log(error)

      return res.status(500).json({
        error: error.message,
      })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.log(err)

    return res.status(500).json({
      error: "Erro interno",
    })
  }
}
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAILS = [
  "henriyurifortt@gmail.com",
]

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        error: "Token não informado",
      })
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({
        error: "Usuário inválido",
      })
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({
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

    return res.status(200).json({
      assinaturas: data,
    })
  } catch (err) {
    console.log(err)

    return res.status(500).json({
      error: "Erro interno",
    })
  }
}
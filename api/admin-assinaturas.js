import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = "henriyurifortt@gmail.com"

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

    if (user.email !== ADMIN_EMAIL) {
      return res.status(403).json({
        error: "Você não tem permissão de admin",
      })
    }

    const { data, error } = await supabaseAdmin
      .from("assinaturas")
      .select(`
        *,
        lojas (
          nome_loja
        )
      `)
      .order("id", { ascending: false })

    if (error) {
      return res.status(500).json({
        error: "Erro ao buscar assinaturas",
      })
    }

    return res.status(200).json({
      assinaturas: data,
    })
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno no admin",
    })
  }
}

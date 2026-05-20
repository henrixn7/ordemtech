import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAILS = ["henriyurifortt@gmail.com"]

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Token não informado" })
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: "Usuário inválido" })
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ error: "Sem permissão" })
    }

    const { user_id, acao } = req.body

    if (!user_id || !acao) {
      return res.status(400).json({ error: "Dados incompletos" })
    }

    let novoStatus = "bloqueado"
    let plano = "Bloqueado"
    let vencimento = null

    if (acao === "liberar") {
      const dataVencimento = new Date()
      dataVencimento.setDate(dataVencimento.getDate() + 30)

      novoStatus = "ativo"
      plano = "Premium"
      vencimento = dataVencimento.toISOString().split("T")[0]
    }

    const { error } = await supabaseAdmin
      .from("assinaturas")
      .upsert({
        user_id,
        status: novoStatus,
        plano,
        vencimento,
        teste_usado: true,
      })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" })
  }
}
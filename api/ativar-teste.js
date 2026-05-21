import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: "Usuário inválido ou sessão expirada" })
    }

    const { user_id } = req.body

    if (!user_id || user.id !== user_id) {
      return res.status(401).json({ error: "Acesso não autorizado" })
    }

    const { data: assinaturaExistente, error: erroBusca } = await supabaseAdmin
      .from("assinaturas")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle()

    if (erroBusca) {
      return res.status(500).json({ error: "Erro ao buscar assinatura" })
    }

    if (assinaturaExistente?.teste_usado) {
      return res.status(400).json({ error: "Teste grátis já utilizado" })
    }

    const vencimento = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]

    const { error } = await supabaseAdmin
      .from("assinaturas")
      .upsert({
        user_id,
        status: "teste",
        plano: "Teste grátis",
        vencimento,
        teste_usado: true,
      })

    if (error) {
      return res.status(500).json({ error: "Erro ao ativar teste grátis" })
    }

    return res.status(200).json({
      success: true,
      message: "Teste grátis ativado",
    })
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" })
  }
}
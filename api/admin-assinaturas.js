import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAILS = ["henriyurifortt@gmail.com"]

export default async function handler(req, res) {
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

    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("assinaturas")
        .select("*")
        .order("id", { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ assinaturas: data || [] })
    }

    if (req.method === "POST") {
      const { user_id, status } = req.body

      if (!user_id || !status) {
        return res.status(400).json({ error: "Dados inválidos" })
      }

      const statusPermitidos = ["ativo", "bloqueado"]

      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido" })
      }

      const { data: assinaturaAtual, error: erroBusca } =
        await supabaseAdmin
          .from("assinaturas")
          .select("*")
          .eq("user_id", user_id)
          .maybeSingle()

      if (erroBusca) {
        return res.status(500).json({
          error: "Erro ao buscar assinatura atual",
        })
      }

      if (!assinaturaAtual) {
        return res.status(404).json({
          error: "Assinatura não encontrada",
        })
      }

      const plano = status === "ativo" ? "Premium" : "Bloqueado"

      const vencimento =
        status === "ativo"
          ? "2027-12-31"
          : new Date().toISOString().split("T")[0]

      const { error: erroUpdate } = await supabaseAdmin
        .from("assinaturas")
        .update({
          status,
          plano,
          vencimento,
        })
        .eq("user_id", user_id)

      if (erroUpdate) {
        return res.status(500).json({
          error: "Erro ao atualizar assinatura",
        })
      }

      const { error: erroLog } = await supabaseAdmin
        .from("logs_admin")
        .insert({
          admin_email: user.email,
          acao: "Atualização de assinatura",
          user_id,
          status_antigo: assinaturaAtual.status || null,
          status_novo: status,
        })

      if (erroLog) {
        console.log("Erro ao salvar log:", erroLog)
      }

      return res.status(200).json({
        success: true,
        message: "Assinatura atualizada",
      })
    }

    return res.status(405).json({ error: "Método não permitido" })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: "Erro interno" })
  }
}
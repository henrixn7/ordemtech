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
      const { data: usuariosData, error: usuariosError } =
        await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        })

      if (usuariosError) {
        return res.status(500).json({ error: usuariosError.message })
      }

      const { data: assinaturasData, error: assinaturasError } =
        await supabaseAdmin.from("assinaturas").select("*")

      if (assinaturasError) {
        return res.status(500).json({ error: assinaturasError.message })
      }

      const assinaturas = usuariosData.users.map((usuario) => {
        const assinatura = assinaturasData.find(
          (item) => item.user_id === usuario.id
        )

        return {
          id: assinatura?.id || usuario.id,
          user_id: usuario.id,
          email: usuario.email,
          loja: assinatura?.loja || usuario.email,
          status: assinatura?.status || "sem assinatura",
          plano: assinatura?.plano || "Grátis",
          vencimento: assinatura?.vencimento || "-",
          criado_em: usuario.created_at,
          ultimo_login: usuario.last_sign_in_at,
        }
      })

      return res.status(200).json({ assinaturas })
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

      const plano = status === "ativo" ? "Premium" : "Bloqueado"

      const vencimento =
        status === "ativo"
          ? "2027-12-31"
          : new Date().toISOString().split("T")[0]

      const { data: assinaturaAtual } = await supabaseAdmin
        .from("assinaturas")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle()

      const { error: erroUpsert } = await supabaseAdmin
        .from("assinaturas")
        .upsert(
          {
            user_id,
            status,
            plano,
            vencimento,
          },
          {
            onConflict: "user_id",
          }
        )

      if (erroUpsert) {
        return res.status(500).json({
          error: "Erro ao salvar assinatura",
        })
      }

      const { error: erroLog } = await supabaseAdmin.from("logs_admin").insert({
        admin_email: user.email,
        acao: "Atualização de assinatura",
        user_id,
        status_antigo: assinaturaAtual?.status || null,
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
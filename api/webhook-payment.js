import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    })
  }

  try {
    const paymentId =
      req.query["data.id"] ||
      req.body?.data?.id ||
      req.body?.id

    if (!paymentId) {
      return res.status(200).json({
        received: true,
      })
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    )

    const payment = await paymentResponse.json()

    if (payment.status !== "approved") {
      return res.status(200).json({
        status: payment.status,
      })
    }

    const userId = payment.external_reference

    if (!userId) {
      return res.status(400).json({
        error: "Usuário não encontrado no pagamento",
      })
    }

    const vencimento = new Date()
    vencimento.setDate(vencimento.getDate() + 30)

    const { error } = await supabaseAdmin
      .from("assinaturas")
      .upsert({
        user_id: userId,
        status: "ativo",
        plano: "Premium",
        vencimento: vencimento.toISOString().split("T")[0],
        teste_usado: true,
      })

    if (error) {
      console.log(error)
      return res.status(500).json({
        error: "Erro ao atualizar assinatura",
      })
    }

    return res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: "Erro no webhook",
    })
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    })
  }

  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({
        error: "Usuário não informado",
      })
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: "OrdemTech Premium",
              quantity: 1,
              currency_id: "BRL",
              unit_price: 29.9,
            },
          ],

          external_reference: user_id,

          notification_url:
            "https://ordemtech.vercel.app/api/webhook-payment",

          back_urls: {
            success: "https://ordemtech.vercel.app/dashboard",
            failure: "https://ordemtech.vercel.app/",
            pending: "https://ordemtech.vercel.app/",
          },

          auto_return: "approved",
        }),
      }
    )

    const data = await response.json()

    return res.status(200).json({
      init_point: data.init_point,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: "Erro ao criar pagamento",
    })
  }
}
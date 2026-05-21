import { createClient } from "@supabase/supabase-js"

const EVOLUTION_URL = "https://evolution-api-production-ea54.up.railway.app"
const EVOLUTION_API_KEY = "ordemtech123"

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
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: "Usuário inválido" })
    }

    const instanceName = `ordemtech_${user.id.replaceAll("-", "")}`

    const response = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        integration: "BAILEYS",
        qrcode: true,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json({
        error: "Erro ao criar instância",
        details: data,
      })
    }

    const qrCode =
      data?.qrcode?.base64 ||
      data?.qrcode ||
      data?.base64 ||
      null

    await supabaseAdmin.from("whatsapp_instancias").upsert(
      {
        user_id: user.id,
        instance_name: instanceName,
        instance_token: EVOLUTION_API_KEY,
        qr_code: qrCode,
        status: "aguardando_qrcode",
      },
      { onConflict: "user_id" }
    )

    return res.status(200).json({
      success: true,
      instanceName,
      qrCode,
      data,
    })
  } catch (error) {
    console.log("ERRO WHATSAPP:", error)
    return res.status(500).json({
      error: "Erro interno ao criar WhatsApp",
    })
  }
}
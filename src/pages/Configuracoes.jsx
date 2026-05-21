import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function Configuracoes() {
  const [nomeLoja, setNomeLoja] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [loadingWhats, setLoadingWhats] = useState(false)

  async function buscarConfiguracoes() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { data } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (data) {
      setNomeLoja(data.nome_loja || "")
      setWhatsapp(data.whatsapp || "")
      setEndereco(data.endereco || "")
      setCnpj(data.cnpj || "")
    }

    const { data: instancia } = await supabase
      .from("whatsapp_instancias")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (instancia?.qr_code) {
      setQrCode(instancia.qr_code)
    }
  }

  async function salvarConfiguracoes() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { error } = await supabase.from("configuracoes").upsert({
      user_id: user.id,
      nome_loja: nomeLoja,
      whatsapp,
      endereco,
      cnpj,
    })

    if (error) {
      toast.error("Erro ao salvar configurações")
      return
    }

    toast.success("Configurações salvas")
  }

  async function conectarWhatsApp() {
    setLoadingWhats(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/criar-instancia-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.log(data)
        toast.error(data.error || "Erro ao conectar WhatsApp")
        return
      }

      setQrCode(data.qrCode)
      toast.success("QR Code gerado")
    } catch (error) {
      console.log(error)
      toast.error("Erro inesperado")
    } finally {
      setLoadingWhats(false)
    }
  }

  useEffect(() => {
    buscarConfiguracoes()
  }, [])

  return (
    <div>
      <h1 className="title">Configurações</h1>

      <div className="panel">
        <h3>Dados da loja</h3>

        <div className="form-row">
          <input
            placeholder="Nome da loja"
            value={nomeLoja}
            onChange={(e) => setNomeLoja(e.target.value)}
          />

          <input
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <input
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <input
            placeholder="CNPJ"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />

          <button className="new-btn" onClick={salvarConfiguracoes}>
            Salvar
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>WhatsApp automático</h3>

        <p>
          Conecte o WhatsApp da loja para enviar mensagens automáticas aos clientes.
        </p>

        <button
          className="new-btn"
          onClick={conectarWhatsApp}
          disabled={loadingWhats}
        >
          {loadingWhats ? "Gerando QR Code..." : "Conectar WhatsApp"}
        </button>

        {qrCode && (
          <div style={{ marginTop: "20px" }}>
            <h4>Escaneie o QR Code</h4>

            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              style={{
                width: "260px",
                maxWidth: "100%",
                background: "#fff",
                padding: "12px",
                borderRadius: "12px",
              }}
            />

            <p>
              Abra o WhatsApp → Aparelhos conectados → Conectar aparelho.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Configuracoes
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function Configuracoes() {
  const [nomeLoja, setNomeLoja] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [cnpj, setCnpj] = useState("")

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
  }

  async function salvarConfiguracoes() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { error } = await supabase
      .from("configuracoes")
      .upsert({
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
    </div>
  )
}

export default Configuracoes

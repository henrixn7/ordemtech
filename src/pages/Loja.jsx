import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Loja() {
  const [nomeLoja, setNomeLoja] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cidade, setCidade] = useState("")

  async function buscarLoja() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("lojas")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (data) {
      setNomeLoja(data.nome_loja || "")
      setWhatsapp(data.whatsapp || "")
      setCidade(data.cidade || "")
    }
  }

  async function salvarLoja() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("lojas")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (data) {
      await supabase
        .from("lojas")
        .update({
          nome_loja: nomeLoja,
          whatsapp,
          cidade,
        })
        .eq("user_id", user.id)

      alert("Loja atualizada!")
    } else {
      await supabase.from("lojas").insert([
        {
          user_id: user.id,
          nome_loja: nomeLoja,
          whatsapp,
          cidade,
        },
      ])

      alert("Loja cadastrada!")
    }
  }

  useEffect(() => {
    buscarLoja()
  }, [])

  return (
    <div>
      <h1 className="title">Minha Loja</h1>

      <div className="panel">
        <div className="form-row">
          <input
            type="text"
            placeholder="Nome da loja"
            value={nomeLoja}
            onChange={(e) => setNomeLoja(e.target.value)}
          />

          <input
            type="text"
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />

          <button className="new-btn" onClick={salvarLoja}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Loja
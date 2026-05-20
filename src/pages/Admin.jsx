import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function Admin() {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState([])

  async function carregarDados() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      toast.error("Sessão inválida")
      return
    }

    const response = await fetch("/api/admin-assinaturas", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.error || "Acesso negado")
      setLoading(false)
      return
    }

    setDados(data.assinaturas || [])
    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  if (loading) {
    return <h1 className="title">Carregando painel admin...</h1>
  }

  return (
    <div>
      <h1 className="title">Painel Admin</h1>

      <div className="card">
        <h2>Assinaturas</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Loja</th>
                <th>Status</th>
                <th>Plano</th>
                <th>Vencimento</th>
                <th>User ID</th>
              </tr>
            </thead>

            <tbody>
              {dados.map((item) => (
                <tr key={item.id}>
                  <td>{item.lojas?.nome_loja || "Sem loja"}</td>
                  <td>{item.status}</td>
                  <td>{item.plano}</td>
                  <td>{item.vencimento}</td>
                  <td>{item.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Admin
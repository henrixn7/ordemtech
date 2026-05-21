import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Admin() {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)

  async function buscarAssinaturas() {
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Sessão expirada. Faça login novamente.")
        return
      }

      const response = await fetch("/api/admin-assinaturas", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Erro ao buscar assinaturas")
        return
      }

      setDados(data.assinaturas || [])
    } catch (error) {
      console.log(error)
      alert("Erro ao buscar assinaturas")
    } finally {
      setLoading(false)
    }
  }

  async function atualizarAssinatura(userId, status) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Sessão expirada. Faça login novamente.")
        return
      }

      const response = await fetch("/api/admin-assinaturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Erro ao atualizar assinatura")
        return
      }

      buscarAssinaturas()
    } catch (error) {
      console.log(error)
      alert("Erro ao atualizar assinatura")
    }
  }

  useEffect(() => {
    buscarAssinaturas()
  }, [])

  return (
    <div className="main">
      <h1 className="title">Painel Admin</h1>

      <div className="panel">
        <h3>Assinaturas</h3>

        {loading ? (
          <p>Carregando assinaturas...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Loja</th>
                <th>Status</th>
                <th>Plano</th>
                <th>Vencimento</th>
                <th>User ID</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {dados.map((item) => (
                <tr key={item.id}>
                  <td>{item.loja || item.user_id}</td>
                  <td>{item.status}</td>
                  <td>{item.plano}</td>
                  <td>{item.vencimento}</td>
                  <td>{item.user_id}</td>

                  <td>
                    <button
                      onClick={() =>
                        atualizarAssinatura(item.user_id, "ativo")
                      }
                      className="btn-premium"
                    >
                      Liberar Premium
                    </button>

                    <button
                      onClick={() =>
                        atualizarAssinatura(item.user_id, "bloqueado")
                      }
                      className="btn-remover"
                      style={{ marginLeft: "8px" }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}

              {dados.length === 0 && (
                <tr>
                  <td colSpan="6">Nenhuma assinatura encontrada</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Admin
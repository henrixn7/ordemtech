import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Admin() {
  const [dados, setDados] = useState([])

  async function buscarAssinaturas() {
    const { data, error } = await supabase
      .from("assinaturas")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setDados(data || [])
  }

  async function atualizarAssinatura(userId, status) {
    const { error } = await supabase
      .from("assinaturas")
      .update({
        status,
        plano: status === "premium" ? "Premium" : "Bloqueado",
      })
      .eq("user_id", userId)

    if (error) {
      console.log(error)
      alert("Erro ao atualizar assinatura")
      return
    }

    buscarAssinaturas()
  }

  useEffect(() => {
    buscarAssinaturas()
  }, [])

  return (
    <div className="main">
      <div className="top-header">
        <div>
          <span className="welcome">Bem-vindo de volta</span>
          <h2>OrdemTech</h2>
        </div>

        <div className="user-box">
          <span>Zero Code</span>

          <button className="logout-btn">
            Sair
          </button>
        </div>
      </div>

      <h1 className="title">Painel Admin</h1>

      <div className="panel">
        <h3>Assinaturas</h3>

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
                <td>{item.user_id}</td>

                <td>{item.status}</td>

                <td>{item.plano}</td>

                <td>{item.vencimento}</td>

                <td>{item.user_id}</td>

                <td>
                  <button
                    onClick={() =>
                      atualizarAssinatura(
                        item.user_id,
                        "premium"
                      )
                    }
                    className="btn-premium"
                  >
                    Liberar Premium
                  </button>

                  <button
                    onClick={() =>
                      atualizarAssinatura(
                        item.user_id,
                        "bloquear"
                      )
                    }
                    className="btn-remover"
                    style={{ marginLeft: "8px" }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin
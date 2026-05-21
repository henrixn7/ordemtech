import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [aparelho, setAparelho] = useState("")

  async function buscarClientes() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setClientes(data || [])
  }

  async function adicionarCliente() {
    if (!nome || !telefone || !aparelho) {
      alert("Preencha todos os campos")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Usuário não encontrado")
      return
    }

    const { error } = await supabase.from("clientes").insert([
      {
        nome,
        telefone,
        aparelho,
        user_id: user.id,
      },
    ])

    if (error) {
      alert("Erro ao adicionar cliente")
      console.log(error)
      return
    }

    setNome("")
    setTelefone("")
    setAparelho("")
    buscarClientes()
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja excluir este cliente?")

    if (!confirmar) return

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erro ao excluir cliente")
      console.log(error)
      return
    }

    buscarClientes()
  }

  function exportarCSV() {
    if (clientes.length === 0) {
      alert("Nenhum cliente para exportar")
      return
    }

    const cabecalho = ["ID", "Nome", "Telefone", "Aparelho"]
    
    const linhas = clientes.map((c) => [
      c.id,
      `"${String(c.nome || "").replace(/"/g, '""')}"`,
      `"${String(c.telefone || "").replace(/"/g, '""')}"`,
      `"${String(c.aparelho || "").replace(/"/g, '""')}"`
    ])

    const csvContent = "\ufeff" + [cabecalho.join(","), ...linhas.map(e => e.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `clientes_ordemtech_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    buscarClientes()
  }, [])

  return (
    <div>
      <h1 className="title">Clientes</h1>

      <div className="panel">
        <h3>Novo Cliente</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            maxLength={15}
            onChange={(e) => {
              let valor = e.target.value.replace(/\D/g, "")

              valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2")
              valor = valor.replace(/(\d{5})(\d)/, "$1-$2")

              setTelefone(valor)
            }}
          />

          <input
            type="text"
            placeholder="Aparelho"
            value={aparelho}
            onChange={(e) => setAparelho(e.target.value)}
          />

          <button className="new-btn" onClick={adicionarCliente}>
            Adicionar
          </button>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Lista de Clientes</h3>
          <button className="new-btn" onClick={exportarCSV}>
            Exportar CSV
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Aparelho</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="4">Nenhum cliente cadastrado</td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.aparelho}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => excluirCliente(cliente.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Clientes
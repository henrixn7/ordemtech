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
            onChange={(e) => setTelefone(e.target.value)}
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
        <h3>Lista de Clientes</h3>

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
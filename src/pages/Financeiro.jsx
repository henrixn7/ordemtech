import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function Financeiro() {
  const [lancamentos, setLancamentos] = useState([])
  const [tipo, setTipo] = useState("entrada")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState("")

  async function buscarLancamentos() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { data, error } = await supabase
      .from("financeiro")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false })

    if (error) {
      toast.error("Erro ao buscar financeiro")
      return
    }

    setLancamentos(data || [])
  }

  async function adicionarLancamento() {
    if (!descricao || !valor) {
      toast.error("Preencha descrição e valor")
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    const { error } = await supabase.from("financeiro").insert({
      user_id: user.id,
      tipo,
      descricao,
      valor: Number(valor),
      data: data || new Date().toISOString().split("T")[0],
    })

    if (error) {
      toast.error("Erro ao adicionar lançamento")
      return
    }

    toast.success("Lançamento adicionado")
    setDescricao("")
    setValor("")
    setData("")
    setTipo("entrada")
    buscarLancamentos()
  }

  async function excluirLancamento(id) {
    const { error } = await supabase
      .from("financeiro")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Erro ao excluir")
      return
    }

    toast.success("Lançamento excluído")
    buscarLancamentos()
  }

  function exportarCSV() {
    if (lancamentos.length === 0) {
      toast.error("Nenhum lançamento para exportar")
      return
    }

    const cabecalho = ["ID", "Tipo", "Descrição", "Valor", "Data"]
    
    const linhas = lancamentos.map((l) => [
      l.id,
      `"${String(l.tipo || "").toUpperCase()}"`,
      `"${String(l.descricao || "").replace(/"/g, '""')}"`,
      l.valor,
      `"${String(l.data || "").replace(/"/g, '""')}"`
    ])

    const csvContent = "\ufeff" + [cabecalho.join(","), ...linhas.map(e => e.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `financeiro_ordemtech_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV exportado com sucesso!")
  }

  useEffect(() => {
    buscarLancamentos()
  }, [])

  const entradas = lancamentos
    .filter((item) => item.tipo === "entrada")
    .reduce((total, item) => total + Number(item.valor), 0)

  const despesas = lancamentos
    .filter((item) => item.tipo === "despesa")
    .reduce((total, item) => total + Number(item.valor), 0)

  const lucro = entradas - despesas

  return (
    <div>
      <h1 className="title">Financeiro</h1>

      <div className="cards">
        <div className="card premium-card">
          <h3>Entradas</h3>
          <p>R$ {entradas.toFixed(2)}</p>
        </div>

        <div className="card premium-card">
          <h3>Despesas</h3>
          <p>R$ {despesas.toFixed(2)}</p>
        </div>

        <div className="card premium-card">
          <h3>Lucro</h3>
          <p>R$ {lucro.toFixed(2)}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Novo lançamento</h3>

        <div className="form-row">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="entrada">Entrada</option>
            <option value="despesa">Despesa</option>
          </select>

          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <input
            type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <button className="new-btn" onClick={adicionarLancamento}>
            Adicionar
          </button>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Lançamentos</h3>
          <button className="new-btn" onClick={exportarCSV}>
            Exportar CSV
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {lancamentos.map((item) => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td>{item.descricao}</td>
                <td>R$ {Number(item.valor).toFixed(2)}</td>
                <td>{item.data}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => excluirLancamento(item.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lancamentos.length === 0 && (
          <p className="empty-text">Nenhum lançamento cadastrado ainda.</p>
        )}
      </div>
    </div>
  )
}

export default Financeiro
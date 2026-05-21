import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [produto, setProduto] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [preco, setPreco] = useState("")

  async function buscarProdutos() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("estoque")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      toast.error("Erro ao buscar produtos")
      console.log(error)
      return
    }

    setProdutos(data || [])
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  async function adicionarProduto() {
    if (!produto || !quantidade || !preco) {
      toast.error("Preencha todos os campos")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("estoque").insert([
      {
        produto,
        quantidade,
        preco,
        user_id: user.id,
      },
    ])

    if (error) {
      toast.error("Erro ao adicionar produto")
      console.log(error)
      return
    }

    toast.success("Produto adicionado")

    setProduto("")
    setQuantidade("")
    setPreco("")

    buscarProdutos()
  }

  async function excluirProduto(id) {
    const resultado = await Swal.fire({
      title: "Excluir produto?",
      text: "O produto será removido do estoque.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#f5c518",
      cancelButtonColor: "#333",
    })

    if (!resultado.isConfirmed) return

    const { error } = await supabase
      .from("estoque")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Erro ao excluir produto")
      console.log(error)
      return
    }

    toast.success("Produto excluído")
    buscarProdutos()
  }

  function exportarCSV() {
    if (produtos.length === 0) {
      toast.error("Nenhum produto para exportar")
      return
    }

    const cabecalho = ["ID", "Produto", "Quantidade", "Preço"]
    
    const linhas = produtos.map((p) => [
      p.id,
      `"${String(p.produto || "").replace(/"/g, '""')}"`,
      p.quantidade,
      p.preco
    ])

    const csvContent = "\ufeff" + [cabecalho.join(","), ...linhas.map(e => e.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `estoque_ordemtech_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV exportado com sucesso!")
  }

  return (
    <div>
      <h1 className="title">Estoque</h1>

      <div className="panel">
        <h3>Novo Produto</h3>

        <div className="form-row">
          <input
            placeholder="Nome do produto"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
          />

          <input
            placeholder="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          <input
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />

          <button className="new-btn" onClick={adicionarProduto}>
            Adicionar
          </button>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Produtos Cadastrados</h3>
          <button className="new-btn" onClick={exportarCSV}>
            Exportar CSV
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((item) => (
              <tr key={item.id}>
                <td>{item.produto}</td>
                <td>{item.quantidade}</td>
                <td>R$ {item.preco}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => excluirProduto(item.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {produtos.length === 0 && (
              <tr>
                <td colSpan="4">Nenhum produto cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Estoque
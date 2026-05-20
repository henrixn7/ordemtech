import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

function Vendas() {
  const [vendas, setVendas] = useState([])
  const [estoque, setEstoque] = useState([])
  const [produtoId, setProdutoId] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [valor, setValor] = useState("")

  async function buscarDados() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const vendasRes = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    const estoqueRes = await supabase
      .from("estoque")
      .select("*")
      .eq("user_id", user.id)
      .order("produto", { ascending: true })

    setVendas(vendasRes.data || [])
    setEstoque(estoqueRes.data || [])
  }

  useEffect(() => {
    buscarDados()
  }, [])

  function selecionarProduto(id) {
    setProdutoId(id)

    const produtoSelecionado = estoque.find(
      (item) => String(item.id) === String(id)
    )

    if (produtoSelecionado) {
      setValor(produtoSelecionado.preco || "")
    }
  }

  async function adicionarVenda() {
    if (!produtoId || !quantidade || !valor) {
      toast.error("Preencha todos os campos")
      return
    }

    const produtoSelecionado = estoque.find(
      (item) => String(item.id) === String(produtoId)
    )

    if (!produtoSelecionado) {
      toast.error("Produto não encontrado")
      return
    }

    const qtdVenda = Number(quantidade)
    const qtdEstoque = Number(produtoSelecionado.quantidade)
    const precoUnitario = Number(String(valor).replace(",", "."))

    if (qtdVenda <= 0) {
      toast.error("Quantidade inválida")
      return
    }

    if (qtdVenda > qtdEstoque) {
      toast.error("Quantidade maior que o estoque")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: vendaError } = await supabase
      .from("vendas")
      .insert([
        {
          produto_id: produtoSelecionado.id,
          produto: produtoSelecionado.produto,
          quantidade: qtdVenda,
          valor: precoUnitario,
          user_id: user.id,
        },
      ])

    if (vendaError) {
      toast.error("Erro ao adicionar venda")
      console.log(vendaError)
      return
    }

    const novoEstoque = qtdEstoque - qtdVenda

    const { error: estoqueError } = await supabase
      .from("estoque")
      .update({ quantidade: novoEstoque })
      .eq("id", Number(produtoSelecionado.id))

    if (estoqueError) {
      toast.error("Erro ao atualizar estoque")
      console.log(estoqueError)
      return
    }

    toast.success("Venda realizada com sucesso")

    setProdutoId("")
    setQuantidade("")
    setValor("")

    buscarDados()
  }

  async function excluirVenda(venda) {
  const resultado = await Swal.fire({
    title: "Excluir venda?",
    text: "A quantidade será devolvida ao estoque.",
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

  const produtoEstoque = estoque.find(
    (item) =>
      String(item.id) === String(venda.produto_id) ||
      item.produto === venda.produto
  )

  if (produtoEstoque) {
    const novoEstoque =
      Number(produtoEstoque.quantidade) + Number(venda.quantidade)

    const { error: estoqueError } = await supabase
      .from("estoque")
      .update({ quantidade: novoEstoque })
      .eq("id", Number(produtoEstoque.id))

    if (estoqueError) {
      toast.error("Erro ao devolver produto ao estoque")
      return
    }
  }

  const { error: deleteError } = await supabase
    .from("vendas")
    .delete()
    .eq("id", venda.id)

  if (deleteError) {
    toast.error("Erro ao excluir venda")
    console.log(deleteError)
    return
  }

  toast.success("Venda excluída")
  buscarDados()
}
  return (
    <div>
      <h1 className="title">Vendas</h1>

      <div className="panel">
        <h3>Nova Venda</h3>

        <div className="form-row">
          <select
            value={produtoId}
            onChange={(e) => selecionarProduto(e.target.value)}
          >
            <option value="">
              {estoque.length === 0
                ? "Nenhum produto encontrado"
                : "Selecione um produto"}
            </option>

            {estoque.map((item) => (
              <option key={item.id} value={item.id}>
                {item.produto} - Estoque: {item.quantidade}
              </option>
            ))}
          </select>

          <input
            placeholder="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          <input
            placeholder="Valor unitário"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <button
            className="new-btn"
            onClick={adicionarVenda}
          >
            Vender
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Vendas Realizadas</h3>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.produto}</td>

                <td>{venda.quantidade}</td>

                <td>
                  {Number(venda.valor).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </td>

                <td>
                  {(
                    Number(venda.quantidade) *
                    Number(venda.valor)
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => excluirVenda(venda)}
                  >
                    Excluir
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

export default Vendas
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Relatorios() {
  const [ordens, setOrdens] = useState([])
  const [clientes, setClientes] = useState([])
  const [vendas, setVendas] = useState([])
  const [financeiro, setFinanceiro] = useState([])

  async function carregarDados() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const ordensData = await supabase
      .from("ordens")
      .select("*")
      .eq("user_id", user.id)

    const clientesData = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", user.id)

    const vendasData = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)

    const financeiroData = await supabase
      .from("financeiro")
      .select("*")
      .eq("user_id", user.id)

    setOrdens(ordensData.data || [])
    setClientes(clientesData.data || [])
    setVendas(vendasData.data || [])
    setFinanceiro(financeiroData.data || [])
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const entradas = financeiro
    .filter((item) => item.tipo === "entrada")
    .reduce((total, item) => total + Number(item.valor), 0)

  const despesas = financeiro
    .filter((item) => item.tipo === "despesa")
    .reduce((total, item) => total + Number(item.valor), 0)

  return (
    <div>
      <h1 className="title">Relatórios</h1>

      <div className="cards">
        <div className="card premium-card">
          <h3>Total de Ordens</h3>
          <p>{ordens.length}</p>
        </div>

        <div className="card premium-card">
          <h3>Total de Clientes</h3>
          <p>{clientes.length}</p>
        </div>

        <div className="card premium-card">
          <h3>Total de Vendas</h3>
          <p>{vendas.length}</p>
        </div>

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
          <p>R$ {(entradas - despesas).toFixed(2)}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Resumo do Sistema</h3>

        <div className="resumo-lista">
          <div>
            <span>Ordens aguardando</span>

            <strong>
              {
                ordens.filter(
                  (item) => String(item.status).toLowerCase() === "aguardando"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>Ordens prontas</span>

            <strong>
              {
                ordens.filter(
                  (item) => String(item.status).toLowerCase() === "pronto"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>Ordens entregues</span>

            <strong>
              {
                ordens.filter(
                  (item) => String(item.status).toLowerCase() === "entregue"
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <button
          className="new-btn"
          onClick={() => window.print()}
        >
          Imprimir relatório
        </button>
      </div>
    </div>
  )
}

export default Relatorios
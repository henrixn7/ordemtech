import { useEffect, useState } from "react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

import {
  FaMoneyBillWave,
  FaUsers,
  FaTools,
  FaBoxOpen,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa"

import { supabase } from "../services/supabase"

function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [ordens, setOrdens] = useState([])
  const [estoque, setEstoque] = useState([])
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)

  async function buscarDados() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (!userId) {
      setLoading(false)
      return
    }

    const [clientesRes, ordensRes, estoqueRes, vendasRes] =
      await Promise.all([
        supabase.from("clientes").select("*").eq("user_id", userId),
        supabase.from("ordens").select("*").eq("user_id", userId),
        supabase.from("estoque").select("*").eq("user_id", userId),
        supabase.from("vendas").select("*").eq("user_id", userId),
      ])

    setClientes(clientesRes.data || [])
    setOrdens(ordensRes.data || [])
    setEstoque(estoqueRes.data || [])
    setVendas(vendasRes.data || [])

    setLoading(false)
  }

  useEffect(() => {
    buscarDados()
  }, [])

  function converterValor(valor) {
    const numero = Number(String(valor || "0").replace(",", "."))
    return isNaN(numero) ? 0 : numero
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const faturamentoOrdens = ordens.reduce((total, ordem) => {
    return total + converterValor(ordem.valor)
  }, 0)

  const faturamentoVendas = vendas.reduce((total, venda) => {
    return (
      total +
      Number(venda.quantidade || 0) *
        converterValor(venda.valor)
    )
  }, 0)

  const faturamentoTotal =
    faturamentoOrdens + faturamentoVendas

  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()

  const vendasMes = vendas.filter((venda) => {
    if (!venda.created_at) return false

    const dataVenda = new Date(venda.created_at)

    return (
      dataVenda.getMonth() === mesAtual &&
      dataVenda.getFullYear() === anoAtual
    )
  })

  const faturamentoMes = vendasMes.reduce((total, venda) => {
    return (
      total +
      Number(venda.quantidade || 0) *
        converterValor(venda.valor)
    )
  }, 0)

  const metaMensal = 10000

  const progressoMeta = Math.min(
    (faturamentoMes / metaMensal) * 100,
    100
  )

  const aguardando = ordens.filter(
    (o) => o.status === "Aguardando"
  ).length

  const analise = ordens.filter(
    (o) => o.status === "Em análise"
  ).length

  const pronto = ordens.filter(
    (o) => o.status === "Pronto"
  ).length

  const entregue = ordens.filter(
    (o) => o.status === "Entregue"
  ).length

  const produtosBaixoEstoque = estoque.filter(
    (p) => Number(p.quantidade) <= 3
  ).length

  const ordensData = [
    { status: "Aguardando", total: aguardando },
    { status: "Análise", total: analise },
    { status: "Pronto", total: pronto },
    { status: "Entregue", total: entregue },
  ]

  const vendasMensais = [
    { mes: "Jan", valor: 0 },
    { mes: "Fev", valor: 0 },
    { mes: "Mar", valor: 0 },
    { mes: "Abr", valor: 0 },
    { mes: "Mai", valor: 0 },
    { mes: "Jun", valor: 0 },
    { mes: "Jul", valor: 0 },
    { mes: "Ago", valor: 0 },
    { mes: "Set", valor: 0 },
    { mes: "Out", valor: 0 },
    { mes: "Nov", valor: 0 },
    { mes: "Dez", valor: 0 },
  ]

  vendas.forEach((venda) => {
    if (!venda.created_at) return

    const data = new Date(venda.created_at)
    const mes = data.getMonth()

    vendasMensais[mes].valor +=
      Number(venda.quantidade || 0) *
      converterValor(venda.valor)
  })

  const ultimasOrdens = [...ordens]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)

  const ultimasVendas = [...vendas]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)

  if (loading) {
    return <h2 className="title">Carregando dashboard...</h2>
  }

  return (
    <div>
      <h1 className="title">Dashboard</h1>

      <div className="cards">
        <div className="card premium-card">
          <div className="card-top">
            <span>Faturamento Total</span>
            <div className="card-icon">
              <FaMoneyBillWave />
            </div>
          </div>

          <p>{formatarMoeda(faturamentoTotal)}</p>
          <small>Valor total movimentado</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Faturamento do Mês</span>
            <div className="card-icon">
              <FaChartLine />
            </div>
          </div>

          <p>{formatarMoeda(faturamentoMes)}</p>
          <small>Resultado mensal atual</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Clientes</span>
            <div className="card-icon">
              <FaUsers />
            </div>
          </div>

          <p>{clientes.length}</p>
          <small>Clientes cadastrados</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Total de Ordens</span>
            <div className="card-icon">
              <FaTools />
            </div>
          </div>

          <p>{ordens.length}</p>
          <small>Ordens registradas</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Produtos</span>
            <div className="card-icon">
              <FaBoxOpen />
            </div>
          </div>

          <p>{estoque.length}</p>
          <small>Produtos cadastrados</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>OS Abertas</span>
            <div className="card-icon">
              <FaTools />
            </div>
          </div>

          <p>{aguardando + analise}</p>
          <small>Ordens pendentes</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Vendas do Mês</span>
            <div className="card-icon">
              <FaChartLine />
            </div>
          </div>

          <p>{vendasMes.length}</p>
          <small>Vendas registradas</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Baixo Estoque</span>
            <div className="card-icon warning">
              <FaExclamationTriangle />
            </div>
          </div>

          <p>{produtosBaixoEstoque}</p>
          <small>Produtos precisando reposição</small>
        </div>
      </div>

      <div className="panel meta-panel">
        <div className="meta-header">
          <div>
            <span>Meta mensal</span>
            <h2>{formatarMoeda(faturamentoMes)}</h2>
          </div>

          <strong>{Math.floor(progressoMeta)}%</strong>
        </div>

        <div className="meta-bar">
          <div
            className="meta-progress"
            style={{
              width: `${progressoMeta}%`,
            }}
          ></div>
        </div>

        <small>Meta atual: {formatarMoeda(metaMensal)}</small>
      </div>

      <div className="charts-grid">
        <div className="panel chart-panel">
          <h3>Ordens por Status</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordensData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#222"
              />

              <XAxis dataKey="status" stroke="#888" />

              <YAxis
                stroke="#888"
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#f5c542"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h3>Faturamento Mensal</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendasMensais}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#222"
              />

              <XAxis dataKey="mes" stroke="#888" />

              <YAxis stroke="#888" />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="valor"
                stroke="#f5c518"
                strokeWidth={4}
                dot={false}
                activeDot={{
                  r: 8,
                  fill: "#f5c518",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="panel activity-panel">
          <h3>Atividades Recentes</h3>

          <div className="activity-list">
            {ultimasOrdens.length === 0 ? (
              <p className="empty-text">
                Nenhuma ordem registrada ainda.
              </p>
            ) : (
              ultimasOrdens.map((ordem) => (
                <div
                  className="activity-item"
                  key={ordem.id}
                >
                  <div className="activity-dot"></div>

                  <div>
                    <strong>
                      {ordem.cliente ||
                        "Cliente não informado"}
                    </strong>

                    <span>
                      {ordem.aparelho ||
                        "Aparelho não informado"}
                    </span>
                  </div>

                  <label
                    className={`activity-status ${String(
                      ordem.status || ""
                    )
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ordem.status || "Sem status"}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <h3>Últimas Vendas</h3>

          <div className="resumo-lista">
            {ultimasVendas.length === 0 ? (
              <p className="empty-text">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              ultimasVendas.map((venda) => (
                <div key={venda.id}>
                  <span>{venda.produto}</span>

                  <strong>
                    {formatarMoeda(
                      Number(venda.quantidade || 0) *
                        converterValor(venda.valor)
                    )}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  FaChartLine,
  FaUsers,
  FaTools,
  FaBox,
  FaMoneyBillWave,
  FaStore,
  FaCrown,
  FaChartBar,
  FaCog,
} from "react-icons/fa"

import { supabase } from "../services/supabase"

function Sidebar() {
  const [plano, setPlano] = useState("Carregando...")
  const [diasRestantes, setDiasRestantes] = useState(null)
  const [nomeLoja, setNomeLoja] = useState("")

  useEffect(() => {
    carregarPlano()
    buscarConfiguracoes()
  }, [])

  async function buscarConfiguracoes() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("configuracoes")
      .select("nome_loja")
      .eq("user_id", user.id)
      .maybeSingle()

    if (data?.nome_loja) {
      setNomeLoja(data.nome_loja)
    }
  }

  async function carregarPlano() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!data) {
      setPlano("Sem plano")
      return
    }

    if (data.status === "teste") {
      setPlano("Teste grátis")

      if (data.vencimento) {
        const hoje = new Date()
        const vencimento = new Date(data.vencimento)
        const diffTime = vencimento.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        setDiasRestantes(diffDays > 0 ? diffDays : 0)
      }

      return
    }

    if (data.status === "ativo") {
      setPlano("Premium")
      return
    }

    setPlano("Sem plano")
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <div className="logo-icon">
            <FaCrown />
          </div>

          <h1>{nomeLoja || "OrdemTech"}</h1>
          <p>SaaS para assistência técnica</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChartLine />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/clientes" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUsers />
            <span>Clientes</span>
          </NavLink>

          <NavLink to="/ordens" className={({ isActive }) => isActive ? "active" : ""}>
            <FaTools />
            <span>Ordens</span>
          </NavLink>

          <NavLink to="/estoque" className={({ isActive }) => isActive ? "active" : ""}>
            <FaBox />
            <span>Estoque</span>
          </NavLink>

          <NavLink to="/vendas" className={({ isActive }) => isActive ? "active" : ""}>
            <FaMoneyBillWave />
            <span>Vendas</span>
          </NavLink>

          <NavLink to="/financeiro" className={({ isActive }) => isActive ? "active" : ""}>
            <FaMoneyBillWave />
            <span>Financeiro</span>
          </NavLink>

          <NavLink to="/relatorios" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChartBar />
            <span>Relatórios</span>
          </NavLink>

          <NavLink to="/configuracoes" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCog />
            <span>Configurações</span>
          </NavLink>

          <NavLink to="/loja" className={({ isActive }) => isActive ? "active" : ""}>
            <FaStore />
            <span>Loja</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <span>Plano atual</span>
        <strong>{plano}</strong>

        {plano === "Teste grátis" && (
          <small
            style={{
              display: "block",
              marginTop: "4px",
              opacity: 0.8,
            }}
          >
            {diasRestantes} dias restantes
          </small>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
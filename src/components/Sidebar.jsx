import { NavLink } from "react-router-dom"

import {
  FaChartLine,
  FaUsers,
  FaTools,
  FaBox,
  FaMoneyBillWave,
  FaStore,
  FaCrown,
} from "react-icons/fa"

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

function Sidebar() {
  const [plano, setPlano] = useState("Carregando...")
  const [diasRestantes, setDiasRestantes] = useState(null)

  useEffect(() => {
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

          const diffTime =
            vencimento.getTime() - hoje.getTime()

          const diffDays = Math.ceil(
            diffTime / (1000 * 60 * 60 * 24)
          )

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

    carregarPlano()
  }, [])

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <div className="logo-icon">
            <FaCrown />
          </div>

          <h1>OrdemTech</h1>
          <p>SaaS para assistência técnica</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaChartLine />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaUsers />
            <span>Clientes</span>
          </NavLink>

          <NavLink
            to="/ordens"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaTools />
            <span>Ordens</span>
          </NavLink>

          <NavLink
            to="/estoque"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaBox />
            <span>Estoque</span>
          </NavLink>

          <NavLink
            to="/vendas"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaMoneyBillWave />
            <span>Vendas</span>
          </NavLink>

          <NavLink
            to="/loja"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FaStore />
            <span>Minha Loja</span>
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
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

function Sidebar() {
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

          <NavLink to="/loja" className={({ isActive }) => isActive ? "active" : ""}>
            <FaStore />
            <span>Minha Loja</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <span>Plano atual</span>
        <strong>Premium</strong>
      </div>
    </aside>
  )
}

export default Sidebar
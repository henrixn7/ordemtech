import "./App.css"

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import { useEffect, useState } from "react"
import { Toaster, toast } from "react-hot-toast"

import { supabase } from "./services/supabase"

import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Ordens from "./pages/Ordens"
import Estoque from "./pages/Estoque"
import Vendas from "./pages/Vendas"
import Login from "./pages/Login"
import Loja from "./pages/Loja"
import RecuperarSenha from "./pages/RecuperarSenha"
import NovaSenha from "./pages/NovaSenha"
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import Acompanhamento from "./pages/Acompanhamento"
import Financeiro from "./pages/Financeiro"
import Relatorios from "./pages/Relatorios"
import Configuracoes from "./pages/Configuracoes"

function Layout({ children }) {
  const [nomeLoja, setNomeLoja] = useState("Minha Loja")

  async function sair() {
    await supabase.auth.signOut()
    toast.success("Você saiu do sistema")
    window.location.href = "/"
  }

  useEffect(() => {
    async function carregarLoja() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("configuracoes")
        .select("nome_loja")
        .eq("user_id", user.id)
        .maybeSingle()

      if (data) {
        setNomeLoja(data.nome_loja || "Minha Loja")
      }
    }

    carregarLoja()
  }, [])

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="top-header">
          <div>
            <span className="welcome">
              Bem-vindo de volta
            </span>

            <h2>OrdemTech</h2>
          </div>

          <div className="user-box">
            <span>{nomeLoja}</span>

            <button
              onClick={sair}
              className="logout-btn"
            >
              Sair
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

function RotaProtegida({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false)
  const params = new URLSearchParams(window.location.search)

const planoSelecionado =
  params.get("plano") || localStorage.getItem("planoSelecionado") || "premium"

  async function verificarAssinatura(userId) {
    try {
      const { data, error } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) {
        console.log("Erro assinatura:", error)
        return false
      }

      if (!data) return false

      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const vencimento = data.vencimento
        ? new Date(data.vencimento)
        : null

      if (vencimento) {
        vencimento.setHours(23, 59, 59, 999)
      }

      const statusOk =
        data.status === "ativo" ||
        data.status === "teste"

      const vencimentoOk =
        !vencimento || vencimento >= hoje

      return statusOk && vencimentoOk
    } catch (error) {
      console.log("Erro geral assinatura:", error)
      return false
    }
  }

  async function ativarTesteGratis() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Usuário não encontrado")
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch("/api/ativar-teste", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "",
      },
      body: JSON.stringify({
        user_id: user.id,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.error || "Erro ao ativar teste grátis")
      return
    }

    toast.success("Teste grátis ativado")
    window.location.reload()
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.log("Erro sessão:", error)
          setAuthenticated(false)
          setAssinaturaAtiva(false)
          return
        }

        if (!session) {
          setAuthenticated(false)
          setAssinaturaAtiva(false)
          return
        }

        setAuthenticated(true)

        const ativa = await verificarAssinatura(
          session.user.id
        )

        setAssinaturaAtiva(ativa)
      } catch (error) {
        console.log("Erro checkAuth:", error)
        setAuthenticated(false)
        setAssinaturaAtiva(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <div className="loader"></div>

          <h1>Carregando...</h1>

          <p>Preparando seu painel OrdemTech</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  if (!assinaturaAtiva) {
    return (
      <div className="bloqueio-page">
        <div className="bloqueio-box">
          <h1>Assinatura necessária</h1>

          <p>
            Seu acesso ao OrdemTech está bloqueado.
            Ative sua assinatura mensal para continuar usando
            o sistema.
          </p>

          <button onClick={ativarTesteGratis}>
            Ativar teste grátis
          </button>

          <button
            style={{
              marginTop: "12px",
              opacity: 0.8,
            }}
            onClick={async () => {
              try {
                const {
                  data: { user },
                } = await supabase.auth.getUser()

                const response = await fetch("/api/create-payment", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
  user_id: user.id,
  plano: planoSelecionado,
}),
                })

                const data = await response.json()

                console.log("Resposta Mercado Pago:", data)

                if (!data.init_point) {
                  alert(data.error || "Mercado Pago não retornou link")
                  return
                }

                window.location.href = data.init_point
              } catch (error) {
                console.log(error)
                alert("Erro ao iniciar pagamento")
              }
            }}
          >
            Assinar agora
          </button>
        </div>
      </div>
    )
  }

  return children
}

function RotaAdmin({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email === "henriyurifortt@gmail.com") {
        setIsAdmin(true)
      }

      setLoading(false)
    }

    checkAdmin()
  }, [])

  if (loading) {
    return <div className="loading-page">Carregando...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
          },
          success: {
            iconTheme: {
              primary: "#f5c518",
              secondary: "#111",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/acompanhar/:codigo"
          element={<Acompanhamento />}
        />

        <Route
          path="/recuperar-senha"
          element={<RecuperarSenha />}
        />

        <Route
          path="/nova-senha"
          element={<NovaSenha />}
        />

        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Layout>
                <Dashboard />
              </Layout>
            </RotaProtegida>
          }
        />

        <Route
          path="/admin"
          element={
            <RotaAdmin>
              <Layout>
                <Admin />
              </Layout>
            </RotaAdmin>
          }
        />

        <Route
          path="/clientes"
          element={
            <RotaProtegida>
              <Layout>
                <Clientes />
              </Layout>
            </RotaProtegida>
          }
        />

        <Route
          path="/ordens"
          element={
            <RotaProtegida>
              <Layout>
                <Ordens />
              </Layout>
            </RotaProtegida>
          }
        />

        <Route
          path="/estoque"
          element={
            <RotaProtegida>
              <Layout>
                <Estoque />
              </Layout>
            </RotaProtegida>
          }
        />

        <Route
          path="/loja"
          element={
            <RotaProtegida>
              <Layout>
                <Loja />
              </Layout>
            </RotaProtegida>
          }
        />

        <Route
          path="/vendas"
          element={
            <RotaProtegida>
              <Layout>
                <Vendas />
              </Layout>
            </RotaProtegida>
          }
        />
        <Route
  path="/financeiro"
  element={
    <RotaProtegida>
      <Layout>
        <Financeiro />
      </Layout>
    </RotaProtegida>
  }
/>
<Route
  path="/relatorios"
  element={
    <RotaProtegida>
      <Layout>
        <Relatorios />
      </Layout>
    </RotaProtegida>
  }
/>
<Route
  path="/configuracoes"
  element={
    <RotaProtegida>
      <Layout>
        <Configuracoes />
      </Layout>
    </RotaProtegida>
  }
/>
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
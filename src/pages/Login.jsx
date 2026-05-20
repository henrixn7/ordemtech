import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function Login() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [isCadastro, setIsCadastro] = useState(false)

  const [nomeLoja, setNomeLoja] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  async function handleAuth(e) {
    e.preventDefault()

    if (!email || !senha) {
      toast.error("Preencha todos os campos")
      return
    }

    if (isCadastro && !nomeLoja) {
      toast.error("Digite o nome da loja")
      return
    }

    setLoading(true)

    try {
      if (isCadastro) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
        })

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          await supabase.from("lojas").insert([
            {
              nome_loja: nomeLoja,
              user_id: data.user.id,
            },
          ])

          await supabase.from("assinaturas").insert([
            {
              user_id: data.user.id,
              status: "teste",
              plano: "Teste grátis",
              vencimento: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
            },
          ])
        }

        toast.success("Conta criada com 7 dias grátis")
        navigate("/dashboard")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        })

        if (error) {
          toast.error("E-mail ou senha inválidos")
          setLoading(false)
          return
        }

        toast.success("Login realizado")
        navigate("/dashboard")
      }
    } catch (err) {
      console.log(err)
      toast.error("Erro inesperado")
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <h1>OrdemTech</h1>
          <p>Sistema inteligente para assistência técnica</p>
        </div>

        <form onSubmit={handleAuth}>
          {isCadastro && (
            <input
              type="text"
              placeholder="Nome da loja"
              value={nomeLoja}
              onChange={(e) => setNomeLoja(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Carregando..."
              : isCadastro
              ? "Criar conta"
              : "Entrar"}
          </button>

          {!isCadastro && (
            <a href="/recuperar-senha" className="forgot-link">
              Esqueci minha senha
            </a>
          )}
        </form>

        <div className="switch-auth">
          {isCadastro ? (
            <p>
              Já possui conta?{" "}
              <span onClick={() => setIsCadastro(false)}>
                Entrar
              </span>
            </p>
          ) : (
            <p>
              Não possui conta?{" "}
              <span onClick={() => setIsCadastro(true)}>
                Criar conta
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
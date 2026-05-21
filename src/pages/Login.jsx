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
          email: email.trim(),
          password: senha,
        })

        if (error) {
          console.log("ERRO SIGNUP:", error)
          toast.error(error.message || "Erro ao criar conta")
          setLoading(false)
          return
        }

        const userId = data?.user?.id

        if (userId) {
          const { error: cfgError } = await supabase
            .from("configuracoes")
            .insert([
              {
                nome_loja: nomeLoja,
                user_id: userId,
              },
            ])

          if (cfgError) {
            console.log("ERRO CONFIGURACOES:", cfgError)
            toast.error("Conta criada, mas erro ao salvar loja")
          }
        }

        toast.success("Conta criada com sucesso")
        navigate("/dashboard")
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        })

        if (error) {
          console.log("ERRO LOGIN:", error)
          toast.error(error.message || "E-mail ou senha inválidos")
          setLoading(false)
          return
        }

        console.log("LOGIN OK:", data)

        toast.success("Login realizado")
        navigate("/dashboard")
      }
    } catch (err) {
      console.log("ERRO INESPERADO:", err)
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
            {loading ? "Carregando..." : isCadastro ? "Criar conta" : "Entrar"}
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
              <span onClick={() => setIsCadastro(false)}>Entrar</span>
            </p>
          ) : (
            <p>
              Não possui conta?{" "}
              <span onClick={() => setIsCadastro(true)}>Criar conta</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
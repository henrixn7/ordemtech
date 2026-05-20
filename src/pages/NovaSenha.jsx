import { useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

function NovaSenha() {
  const [senha, setSenha] = useState("")
  const navigate = useNavigate()

  async function alterarSenha(e) {
    e.preventDefault()

    if (!senha || senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: senha,
    })

    if (error) {
      toast.error("Erro ao alterar senha")
      console.log(error)
      return
    }

    toast.success("Senha alterada com sucesso")
    navigate("/login")
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={alterarSenha}>
        <h1>Nova senha</h1>
        <p>Digite sua nova senha abaixo.</p>

        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">Alterar senha</button>
      </form>
    </div>
  )
}

export default NovaSenha
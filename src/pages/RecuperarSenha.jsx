import { useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"

function RecuperarSenha() {
  const [email, setEmail] = useState("")

  async function enviarRecuperacao(e) {
    e.preventDefault()

    if (!email) {
      toast.error("Digite seu e-mail")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    if (error) {
      toast.error("Erro ao enviar recuperação")
      console.log(error)
      return
    }

    toast.success("Link enviado para seu e-mail")
    setEmail("")
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={enviarRecuperacao}>
        <h1>Recuperar senha</h1>
        <p>Digite seu e-mail para receber o link de recuperação.</p>

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Enviar link</button>
      </form>
    </div>
  )
}

export default RecuperarSenha
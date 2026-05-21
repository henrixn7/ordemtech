import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../services/supabase"

function Acompanhamento() {
  const { codigo } = useParams()
  const [ordem, setOrdem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function buscarOrdem() {
      const { data, error } = await supabase
        .from("ordens")
        .select("*")
        .eq("codigo_acompanhamento", codigo)
        .maybeSingle()

      if (!error && data) {
        setOrdem(data)
      }

      setLoading(false)
    }

    buscarOrdem()

    const interval = setInterval(() => {
      buscarOrdem()
    }, 10000)

    return () => clearInterval(interval)
  }, [codigo])

  function etapaAtiva(etapa) {
    const etapas = ["Aguardando", "Em análise", "Pronto", "Entregue"]
    const statusAtual = etapas.indexOf(ordem?.status)
    const etapaAtual = etapas.indexOf(etapa)

    return etapaAtual <= statusAtual
  }

  function mensagemStatus() {
    if (ordem?.status === "Aguardando") {
      return "Seu aparelho foi recebido pela assistência técnica."
    }

    if (ordem?.status === "Em análise") {
      return "Seu aparelho está sendo analisado pela equipe técnica."
    }

    if (ordem?.status === "Pronto") {
      return "Seu aparelho já está pronto para retirada."
    }

    if (ordem?.status === "Entregue") {
      return "Seu aparelho foi entregue com sucesso."
    }

    return "Acompanhe aqui o andamento da sua ordem de serviço."
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <div className="loader"></div>
          <h1>Carregando...</h1>
          <p>Buscando sua ordem de serviço</p>
        </div>
      </div>
    )
  }

  if (!ordem) {
    return (
      <div className="acompanhamento-page">
        <div className="acompanhamento-card">
          <span className="acompanhamento-badge">OrdemTech</span>
          <h1>OS não encontrada</h1>
          <p>Verifique se o link está correto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="acompanhamento-page">
      <div className="acompanhamento-card">
        <span className="acompanhamento-badge">OrdemTech</span>

        <h1>Acompanhamento da OS</h1>

        <p className="acompanhamento-subtitle">
          Consulte o andamento do seu aparelho em tempo real.
        </p>

        <div className="acompanhamento-status">{ordem.status}</div>

        <p className="status-msg">{mensagemStatus()}</p>

        <p className="previsao">Prazo médio: 1 a 3 dias úteis</p>

        <div className="timeline">
          {["Aguardando", "Em análise", "Pronto", "Entregue"].map((etapa) => (
            <div
              key={etapa}
              className={`timeline-step ${etapaAtiva(etapa) ? "active" : ""}`}
            >
              <div className="timeline-dot"></div>
              <span>{etapa}</span>
            </div>
          ))}
        </div>

        <div className="acompanhamento-grid">
          <div>
            <span>Cliente</span>
            <strong>{ordem.cliente}</strong>
          </div>

          <div>
            <span>Aparelho</span>
            <strong>{ordem.aparelho}</strong>
          </div>

          <div>
            <span>Marca</span>
            <strong>{ordem.marca || "Não informado"}</strong>
          </div>

          <div>
            <span>Serviço</span>
            <strong>{ordem.servico}</strong>
          </div>

          <div>
            <span>Valor</span>
            <strong>R$ {ordem.valor}</strong>
          </div>

          <div>
            <span>Código</span>
            <strong>{ordem.codigo_acompanhamento}</strong>
          </div>
        </div>

        {ordem.observacoes && (
          <div className="acompanhamento-observacao">
            <span>Observações</span>
            <p>{ordem.observacoes}</p>
          </div>
        )}

        {ordem.foto_url && (
          <img
            src={ordem.foto_url}
            alt="Foto do aparelho"
            className="acompanhamento-foto"
          />
        )}

        <p className="acompanhamento-footer">
          Atualizado automaticamente pela assistência técnica.
        </p>
      </div>
    </div>
  )
}

export default Acompanhamento
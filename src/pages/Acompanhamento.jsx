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
  }, [codigo])

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
          <h1>OS não encontrada</h1>
          <p>Verifique se o link está correto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="acompanhamento-page">
      <div className="acompanhamento-card">
        <span className="acompanhamento-badge">
          OrdemTech
        </span>

        <h1>Acompanhamento da OS</h1>

        <p className="acompanhamento-subtitle">
          Consulte o andamento do seu aparelho em tempo real.
        </p>

        <div className="acompanhamento-status">
          {ordem.status}
        </div>
        <div className="timeline">
  <div
    className={`timeline-step ${
      ordem.status === "Aguardando"
        ? "active"
        : ""
    }`}
  >
    <div className="timeline-dot"></div>
    <span>Aguardando</span>
  </div>

  <div
    className={`timeline-step ${
      ordem.status === "Em análise"
        ? "active"
        : ""
    }`}
  >
    <div className="timeline-dot"></div>
    <span>Em análise</span>
  </div>

  <div
    className={`timeline-step ${
      ordem.status === "Pronto"
        ? "active"
        : ""
    }`}
  >
    <div className="timeline-dot"></div>
    <span>Pronto</span>
  </div>

  <div
    className={`timeline-step ${
      ordem.status === "Entregue"
        ? "active"
        : ""
    }`}
  >
    <div className="timeline-dot"></div>
    <span>Entregue</span>
  </div>
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
          Atualizado pela assistência técnica.
        </p>
      </div>
    </div>
  )
}

export default Acompanhamento
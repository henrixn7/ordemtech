import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"
import { QRCodeCanvas } from "qrcode.react"

import {
  FaClock,
  FaSearch,
  FaCheckCircle,
  FaBoxOpen,
} from "react-icons/fa"

function Ordens() {
  const [ordens, setOrdens] = useState([])
  const [cliente, setCliente] = useState("")
  const [telefone, setTelefone] = useState("")
  const [aparelho, setAparelho] = useState("")
  const [marca, setMarca] = useState("")
  const [imei, setImei] = useState("")
  const [servico, setServico] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [valor, setValor] = useState("")
  const [status, setStatus] = useState("Aguardando")
  const [foto, setFoto] = useState(null)
  const [busca, setBusca] = useState("")
  const [editandoId, setEditandoId] = useState(null)

  function formatarNumeroOS(numero) {
    return `OS #${String(numero || 0).padStart(4, "0")}`
  }

  function gerarCodigoAcompanhamento() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  function gerarLinkAcompanhamento(ordem) {
    return `${window.location.origin}/acompanhar/${ordem.codigo_acompanhamento}`
  }

  async function copiarLinkAcompanhamento(ordem) {
    if (!ordem.codigo_acompanhamento) {
      toast.error("Essa OS ainda não possui código de acompanhamento")
      return
    }

    await navigator.clipboard.writeText(gerarLinkAcompanhamento(ordem))
    toast.success("Link de acompanhamento copiado")
  }

  async function buscarOrdens() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("ordens")
      .select("*")
      .eq("user_id", user.id)
      .order("numero_os", { ascending: false })

    if (error) {
      console.log(error)
      toast.error("Erro ao buscar ordens")
      return
    }

    setOrdens(data || [])
  }

  useEffect(() => {
    buscarOrdens()
  }, [])

  const ordensFiltradas = ordens.filter((ordem) =>
    `${ordem.numero_os} ${ordem.cliente} ${ordem.telefone} ${ordem.aparelho} ${ordem.marca} ${ordem.imei} ${ordem.servico} ${ordem.status} ${ordem.codigo_acompanhamento}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  async function gerarNumeroOS(userId) {
    const { data, error } = await supabase
      .from("ordens")
      .select("numero_os")
      .eq("user_id", userId)
      .order("numero_os", { ascending: false })
      .limit(1)

    if (error) {
      console.log(error)
      return 1
    }

    const ultimoNumero = data?.[0]?.numero_os || 0
    return ultimoNumero + 1
  }

  function limparCampos() {
    setCliente("")
    setTelefone("")
    setAparelho("")
    setMarca("")
    setImei("")
    setServico("")
    setObservacoes("")
    setValor("")
    setStatus("Aguardando")
    setFoto(null)
    setEditandoId(null)
  }

  async function adicionarOrdem() {
    if (!cliente || !telefone || !aparelho || !servico || !valor) {
      toast.error("Preencha cliente, telefone, aparelho, serviço e valor")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    let foto_url = ""

    if (foto) {
      const nomeArquivo = `${Date.now()}-${foto.name}`

      const { error: uploadError } = await supabase.storage
        .from("fotos-ordens")
        .upload(nomeArquivo, foto)

      if (uploadError) {
        toast.error("Erro ao enviar foto")
        console.log(uploadError)
        return
      }

      const { data } = supabase.storage
        .from("fotos-ordens")
        .getPublicUrl(nomeArquivo)

      foto_url = data.publicUrl
    }

    const numeroOS = await gerarNumeroOS(user.id)
    const codigoAcompanhamento = gerarCodigoAcompanhamento()

    const { error } = await supabase.from("ordens").insert([
      {
        numero_os: numeroOS,
        cliente,
        telefone,
        aparelho,
        marca,
        imei,
        servico,
        observacoes,
        valor,
        status,
        foto_url,
        user_id: user.id,
        codigo_acompanhamento: codigoAcompanhamento,
      },
    ])

    if (error) {
      toast.error("Erro ao adicionar ordem")
      console.log(error)
      return
    }

    limparCampos()
    toast.success("OS criada com sucesso")
    buscarOrdens()
  }

  async function excluirOrdem(id) {
    const resultado = await Swal.fire({
      title: "Excluir OS?",
      text: "Essa ordem de serviço será removida permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#f5c518",
      cancelButtonColor: "#333",
    })

    if (!resultado.isConfirmed) return

    const { error } = await supabase.from("ordens").delete().eq("id", id)

    if (error) {
      toast.error("Erro ao excluir OS")
      console.log(error)
      return
    }

    toast.success("OS excluída")
    buscarOrdens()
  }

 async function atualizarStatus(id, novoStatus) {
  const ordem = ordens.find((o) => o.id === id)

  const { error } = await supabase
    .from("ordens")
    .update({ status: novoStatus })
    .eq("id", id)

  if (error) {
    toast.error("Erro ao atualizar status")
    console.log(error)
    return
  }

  toast.success("Status atualizado")

  if (ordem) {
    const numero = String(ordem.telefone || "").replace(/\D/g, "")

    const link = ordem.codigo_acompanhamento
      ? gerarLinkAcompanhamento(ordem)
      : ""

    let mensagem = `Olá ${ordem.cliente}, sua ordem de serviço foi atualizada.\n\n`

    mensagem += `${formatarNumeroOS(ordem.numero_os)}\n`
    mensagem += `Status: ${novoStatus}\n`
    mensagem += `Aparelho: ${ordem.aparelho}\n\n`

    if (novoStatus === "Em análise") {
      mensagem += "Seu aparelho está em análise pela equipe técnica.\n\n"
    }

    if (novoStatus === "Pronto") {
      mensagem += "Seu aparelho já está pronto para retirada ✅\n\n"
    }

    if (novoStatus === "Entregue") {
      mensagem += "Seu aparelho foi entregue com sucesso 🤝\n\n"
    }

    mensagem += `Acompanhe sua OS:\n${link}\n\n`
    mensagem += `OrdemTech`

    const texto = encodeURIComponent(mensagem)

    if (numero) {
      window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank")
    }
  }

  buscarOrdens()
}

  function editarOrdem(ordem) {
    setEditandoId(ordem.id)
    setCliente(ordem.cliente || "")
    setTelefone(ordem.telefone || "")
    setAparelho(ordem.aparelho || "")
    setMarca(ordem.marca || "")
    setImei(ordem.imei || "")
    setServico(ordem.servico || "")
    setObservacoes(ordem.observacoes || "")
    setValor(ordem.valor || "")
    setStatus(ordem.status || "Aguardando")
  }

  async function salvarEdicao() {
    if (!editandoId) return

    const { error } = await supabase
      .from("ordens")
      .update({
        cliente,
        telefone,
        aparelho,
        marca,
        imei,
        servico,
        observacoes,
        valor,
        status,
      })
      .eq("id", editandoId)

    if (error) {
      toast.error("Erro ao editar OS")
      console.log(error)
      return
    }

    toast.success("OS atualizada")
    limparCampos()
    buscarOrdens()
  }

  function enviarWhatsApp(ordem) {
    const numero = String(ordem.telefone || "").replace(/\D/g, "")
    const linkAcompanhamento = ordem.codigo_acompanhamento
      ? gerarLinkAcompanhamento(ordem)
      : "Link indisponível"

    const mensagem = `Olá ${ordem.cliente}, sua ordem de serviço foi atualizada.

${formatarNumeroOS(ordem.numero_os)}
Status: ${ordem.status}
Aparelho: ${ordem.aparelho}
Marca: ${ordem.marca || "Não informado"}
Serviço: ${ordem.servico}
Valor: R$ ${ordem.valor}

Acompanhe sua OS:
${linkAcompanhamento}

OrdemTech`

    const texto = encodeURIComponent(mensagem)

    if (numero) {
      setTimeout(() => {
  window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank")
}, 300)
    } else {
      window.open(`https://wa.me/?text=${texto}`, "_blank")
    }
  }

  function imprimirOrdem(ordem) {
    const janela = window.open("", "", "width=900,height=800")
    const linkAcompanhamento = ordem.codigo_acompanhamento
  ? gerarLinkAcompanhamento(ordem)
  : ""

const qrCodeUrl = linkAcompanhamento
  ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkAcompanhamento)}`
  : ""

    janela.document.write(`
      <html>
        <head>
          <title>${formatarNumeroOS(ordem.numero_os)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px; color: #111; }
            .container { max-width: 800px; margin: auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
            .topo { background: linear-gradient(135deg,#111,#1d1d1d); color: white; padding: 35px; }
            .logo { font-size: 34px; font-weight: bold; color: #f5c518; }
            .sub { color: #aaa; margin-top: 5px; font-size: 14px; }
            .os-box { margin-top: 25px; background: #f5c518; color: #111; display: inline-block; padding: 10px 18px; border-radius: 12px; font-weight: bold; font-size: 18px; }
            .conteudo { padding: 35px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px; }
            .item { background: #fafafa; border: 1px solid #eee; padding: 16px; border-radius: 14px; }
            .item strong { display: block; color: #666; margin-bottom: 8px; font-size: 13px; }
            .item span { font-size: 16px; color: #111; word-break: break-word; }
            .full { grid-column: 1 / -1; }
            .foto-box { margin-top: 25px; text-align: center; }
            .foto-box img { width: 260px; border-radius: 18px; border: 4px solid #f5c518; }
            .rodape { margin-top: 45px; padding-top: 25px; border-top: 2px dashed #ddd; text-align: center; }
            .assinatura { margin-top: 60px; }
            .linha { width: 260px; height: 1px; background: #111; margin: 0 auto 10px auto; }
            .status { display: inline-block; padding: 8px 16px; border-radius: 999px; font-weight: bold; background: #f5c518; color: #111; }
            @media print {
              body { background: white; padding: 0; }
              .container { box-shadow: none; }
            }
              .qr-box {
  margin-top: 20px;
  text-align: center;
  border-top: 1px dashed #999;
  padding-top: 15px;
}

.qr-box img {
  width: 120px;
  height: 120px;
  margin-top: 10px;
}

.qr-box h3 {
  margin-bottom: 8px;
  color: #6d28d9;
}

.qr-box small {
  display: block;
  margin-top: 8px;
  color: #666;
  font-size: 11px;
  word-break: break-all;
}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="topo">
              <div class="logo">OrdemTech</div>
              <div class="sub">Sistema para Assistência Técnica</div>
              <div class="os-box">${formatarNumeroOS(ordem.numero_os)}</div>
            </div>

            <div class="conteudo">
              <div class="grid">
                <div class="item"><strong>CLIENTE</strong><span>${ordem.cliente}</span></div>
                <div class="item"><strong>TELEFONE</strong><span>${ordem.telefone}</span></div>
                <div class="item"><strong>APARELHO</strong><span>${ordem.aparelho}</span></div>
                <div class="item"><strong>MARCA</strong><span>${ordem.marca || "Não informado"}</span></div>
                <div class="item"><strong>IMEI</strong><span>${ordem.imei || "Não informado"}</span></div>
                <div class="item"><strong>VALOR</strong><span>R$ ${Number(ordem.valor || 0).toLocaleString("pt-BR")}</span></div>
                <div class="item full"><strong>SERVIÇO / DEFEITO</strong><span>${ordem.servico}</span></div>
                <div class="item full"><strong>OBSERVAÇÕES</strong><span>${ordem.observacoes || "Nenhuma observação"}</span></div>
                <div class="item"><strong>STATUS</strong><span class="status">${ordem.status}</span></div>
                <div class="item"><strong>DATA</strong><span>${new Date().toLocaleDateString("pt-BR")}</span></div>
                <div class="item full"><strong>LINK DE ACOMPANHAMENTO</strong><span>${ordem.codigo_acompanhamento ? gerarLinkAcompanhamento(ordem) : "Não disponível"}</span></div>
              </div>

              ${ordem.foto_url ? `<div class="foto-box"><img src="${ordem.foto_url}" /></div>` : ""}
               ${qrCodeUrl ? `
  <div class="qr-box">
    <h3>Acompanhe sua ordem online</h3>
    <p>Escaneie o QR Code abaixo:</p>

    <img src="${qrCodeUrl}" />

    <small>${linkAcompanhamento}</small>
  </div>
` : ""}
              <div class="rodape">
                <p>Documento gerado automaticamente pelo OrdemTech</p>
                <div class="assinatura">
                  <div class="linha"></div>
                  Assinatura do Cliente
                </div>
              </div>
            </div>
          </div>
          <script>window.print()</script>
        </body>
      </html>
    `)

    janela.document.close()
  }

  const aguardando = ordens.filter((o) => o.status === "Aguardando").length
  const analise = ordens.filter((o) => o.status === "Em análise").length
  const pronto = ordens.filter((o) => o.status === "Pronto").length
  const entregue = ordens.filter((o) => o.status === "Entregue").length

  return (
    <div>
      <h1 className="title">Ordens de Serviço</h1>

      <div className="cards">
        <div className="card premium-card">
          <div className="card-top">
            <span>Aguardando</span>
            <div className="card-icon warning"><FaClock /></div>
          </div>
          <p>{aguardando}</p>
          <small>Ordens aguardando atendimento</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Em análise</span>
            <div className="card-icon"><FaSearch /></div>
          </div>
          <p>{analise}</p>
          <small>Aparelhos em análise técnica</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Pronto</span>
            <div className="card-icon"><FaCheckCircle /></div>
          </div>
          <p>{pronto}</p>
          <small>Ordens finalizadas</small>
        </div>

        <div className="card premium-card">
          <div className="card-top">
            <span>Entregue</span>
            <div className="card-icon"><FaBoxOpen /></div>
          </div>
          <p>{entregue}</p>
          <small>Ordens entregues ao cliente</small>
        </div>
      </div>

      <div className="panel">
        <h3>{editandoId ? "Editar Ordem" : "Nova Ordem"}</h3>

        <div className="form-row">
          <input placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          <input
  placeholder="Telefone"
  value={telefone}
  maxLength={15}
  onChange={(e) => {
    let valor = e.target.value.replace(/\D/g, "")

    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2")
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2")

    setTelefone(valor)
  }}
/>
          <input placeholder="Aparelho" value={aparelho} onChange={(e) => setAparelho(e.target.value)} />
          <input placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <input
  placeholder="IMEI"
  value={imei}
  maxLength={17}
  onChange={(e) => {
    const valor = e.target.value.replace(/\D/g, "")
    setImei(valor)
  }}
/>
          <input placeholder="Serviço / Defeito" value={servico} onChange={(e) => setServico(e.target.value)} />
          <input placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Aguardando</option>
            <option>Em análise</option>
            <option>Pronto</option>
            <option>Entregue</option>
          </select>

          <input placeholder="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

          <label className="upload-btn">
            {foto ? foto.name : "Adicionar Foto"}
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} hidden />
          </label>

          <button className="new-btn" onClick={editandoId ? salvarEdicao : adicionarOrdem}>
            {editandoId ? "Salvar Edição" : "Adicionar"}
          </button>

          {editandoId && (
            <button className="delete-btn" onClick={limparCampos}>
              Cancelar edição
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Lista de Ordens</h3>

        <input
          className="search-input"
          placeholder="Buscar por OS, cliente, telefone, aparelho, IMEI, serviço, status ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>OS</th>
              <th>Foto</th>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Aparelho</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {ordensFiltradas.map((ordem) => (
              <tr key={ordem.id}>
                <td>
                  <strong>{formatarNumeroOS(ordem.numero_os)}</strong>
                  <br />
                  <small>{ordem.codigo_acompanhamento || "Sem código"}</small>
                </td>

                <td>
                  {ordem.foto_url ? (
                    <img src={ordem.foto_url} className="ordem-foto" alt="Foto da ordem" />
                  ) : (
                    "Sem foto"
                  )}
                </td>

                <td>
                  <strong>{ordem.cliente}</strong>
                  <br />
                  <small>IMEI: {ordem.imei || "Não informado"}</small>
                </td>

                <td>{ordem.telefone}</td>

                <td>
                  {ordem.aparelho}
                  <br />
                  <small>{ordem.marca}</small>
                </td>

                <td>
                  {ordem.servico}
                  <br />
                  <small>{ordem.observacoes}</small>
                </td>

                <td>R$ {ordem.valor}</td>

                <td>
                  <select
                    className={`status-select ${String(ordem.status || "").replace(" ", "-").toLowerCase()}`}
                    value={ordem.status}
                    onChange={(e) => atualizarStatus(ordem.id, e.target.value)}
                  >
                    <option>Aguardando</option>
                    <option>Em análise</option>
                    <option>Pronto</option>
                    <option>Entregue</option>
                  </select>
                </td>

                <td>
                  <button className="whatsapp-btn" onClick={() => enviarWhatsApp(ordem)}>
                    WhatsApp
                  </button>

                  <button className="new-btn" onClick={() => copiarLinkAcompanhamento(ordem)}>
                    Copiar Link
                  </button>

                  <button className="new-btn" onClick={() => imprimirOrdem(ordem)}>
                    Imprimir
                  </button>

                  <button className="edit-btn" onClick={() => editarOrdem(ordem)}>
                    Editar
                  </button>

                  <button className="delete-btn" onClick={() => excluirOrdem(ordem.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Ordens
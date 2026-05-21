import { Link } from "react-router-dom"

import {
  FaTools,
  FaChartLine,
  FaBox,
  FaWhatsapp,
  FaFilePdf,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa"

function Home() {
  return (
    <div className="home-page">

      {/* HERO */}

      <section className="hero">

        <header className="hero-header">

          <div className="hero-logo">
            OrdemTech
          </div>

          <nav>

            <a href="#funcionalidades">
              Funcionalidades
            </a>

            <a href="#problemas">
              Problemas
            </a>

            <a href="#como-funciona">
              Como funciona
            </a>

            <a href="#planos">
              Planos
            </a>

            <Link to="/login" className="login-link">
              Entrar
            </Link>

          </nav>

        </header>

        <div className="hero-content">

          {/* ESQUERDA */}

          <div className="hero-left">

            <span className="hero-badge">
              Sistema completo para assistência técnica
            </span>

            <h1>
              Pare de perder clientes e organize sua assistência técnica de verdade
            </h1>

            <p>
              Controle ordens de serviço, estoque,
              clientes, vendas e faturamento em um
              único sistema moderno, rápido e profissional.
            </p>

            <div className="hero-buttons">

              <Link to="/login" className="primary-btn">
                Testar grátis por 7 dias
              </Link>

              <a
                href="#funcionalidades"
                className="secondary-btn"
              >
                Ver funcionalidades
              </a>

            </div>

            <div className="hero-stats">

              <div>
                <strong>+100%</strong>
                <span>Mais organização</span>
              </div>

              <div>
                <strong>24h</strong>
                <span>Acesso online</span>
              </div>

              <div>
                <strong>7 dias</strong>
                <span>Teste grátis</span>
              </div>

            </div>

          </div>

          {/* DIREITA */}

          <div className="hero-right">

            <div className="system-mockup real-dashboard">
  <img
    src="/dashboard-real.png"
    alt="Dashboard OrdemTech"
    className="dashboard-image"
  />
</div>

          </div>

        </div>

      </section>

      {/* PROBLEMAS */}

      <section className="problemas" id="problemas">

        <h2>Você sofre com isso?</h2>

        <div className="problemas-grid">

          <div className="problema-card">
            ❌ Ordens perdidas em papel
          </div>

          <div className="problema-card">
            ❌ Estoque bagunçado
          </div>

          <div className="problema-card">
            ❌ Clientes sem retorno
          </div>

          <div className="problema-card">
            ❌ Falta de controle financeiro
          </div>

          <div className="problema-card">
            ❌ Atendimento lento
          </div>

          <div className="problema-card">
            ❌ Falta de profissionalismo
          </div>

        </div>

      </section>

      {/* SOLUÇÃO */}

      <section className="solucao">

        <div className="solucao-box">

          <div className="solucao-left">

            <span>Solução completa</span>

            <h2>
              O OrdemTech organiza toda sua assistência técnica
            </h2>

            <p>
              Centralize ordens, estoque,
              clientes e financeiro em uma única
              plataforma moderna e profissional.
            </p>

            <ul>

              <li>
                <FaCheckCircle />
                Controle completo das ordens
              </li>

              <li>
                <FaCheckCircle />
                PDFs profissionais
              </li>

              <li>
                <FaCheckCircle />
                Dashboard financeiro
              </li>

              <li>
                <FaCheckCircle />
                Sistema online e seguro
              </li>

            </ul>

          </div>

          <div className="solucao-right">

            <div className="mini-card">
              <FaClock />
              <span>Mais agilidade</span>
            </div>

            <div className="mini-card">
              <FaMoneyBillWave />
              <span>Mais controle financeiro</span>
            </div>

            <div className="mini-card">
              <FaMobileAlt />
              <span>Acesso pelo celular</span>
            </div>

          </div>

        </div>

      </section>

      {/* FUNCIONALIDADES */}

      <section
        className="funcionalidades"
        id="funcionalidades"
      >

        <h2>Funcionalidades do sistema</h2>

        <div className="features-grid">

          <div className="feature-card">

            <FaTools />

            <h3>Ordens de Serviço</h3>

            <p>
              Cadastro completo de aparelhos,
              fotos, IMEI, status e histórico.
            </p>

          </div>

          <div className="feature-card">

            <FaBox />

            <h3>Controle de Estoque</h3>

            <p>
              Controle produtos, quantidade
              e alertas de baixo estoque.
            </p>

          </div>

          <div className="feature-card">

            <FaChartLine />

            <h3>Dashboard Financeiro</h3>

            <p>
              Veja faturamento,
              crescimento e vendas.
            </p>

          </div>

          <div className="feature-card">

            <FaWhatsapp />

            <h3>WhatsApp Integrado</h3>

            <p>
              Envie atualizações rapidamente
              para clientes.
            </p>

          </div>

          <div className="feature-card">

            <FaFilePdf />

            <h3>PDF Profissional</h3>

            <p>
              Gere ordens premium
              prontas para impressão.
            </p>

          </div>

          <div className="feature-card">

            <FaShieldAlt />

            <h3>Segurança</h3>

            <p>
              Sistema protegido com login
              e recuperação de senha.
            </p>

          </div>

        </div>

      </section>

      {/* COMO FUNCIONA */}

      <section
        className="como-funciona"
        id="como-funciona"
      >

        <h2>Como funciona?</h2>

        <div className="steps-grid">

          <div className="step-card">

            <span>01</span>

            <h3>Cadastre sua loja</h3>

            <p>
              Crie sua conta gratuitamente
              em poucos segundos.
            </p>

          </div>

          <div className="step-card">

            <span>02</span>

            <h3>Organize suas ordens</h3>

            <p>
              Gerencie aparelhos,
              clientes e serviços.
            </p>

          </div>

          <div className="step-card">

            <span>03</span>

            <h3>Acompanhe seu crescimento</h3>

            <p>
              Veja relatórios e faturamento
              em tempo real.
            </p>

          </div>

        </div>

      </section>

      {/* PLANOS */}

      <section className="planos" id="planos">
  <span className="section-tag">Planos</span>

  <h2>Escolha o plano ideal para sua assistência</h2>

  <p className="section-subtitle">
    Organize clientes, ordens, estoque e vendas em um único sistema profissional.
  </p>

  <div className="planos-grid">

    {/* Básico */}
    <div className="plano-card">
      <h3>Básico</h3>

      <div className="plano-preco">
        <strong>R$ 29,90</strong>
        <span>/mês</span>
      </div>

      <ul>
        <li>✔ Até 150 ordens/mês</li>
        <li>✔ Cadastro de clientes</li>
        <li>✔ Controle básico</li>
        <li>✔ Vendas</li>
        <li>✔ WhatsApp</li>
        <li>✔ Suporte básico</li>
      </ul>

     <Link
  to="/login?plano=basico"
  onClick={() => localStorage.setItem("planoSelecionado", "basico")}
  className="secondary-btn full"
>
  Assinar plano
</Link>
    </div>

    {/* Premium */}
    <div className="plano-card destaque">
      <span className="plano-badge">
        Mais usado
      </span>

      <h3>Premium</h3>

      <div className="plano-preco">
        <strong>R$ 49,90</strong>
        <span>/mês</span>
      </div>

      <ul>
        <li>✔ Ordens ilimitadas</li>
        <li>✔ Dashboard premium</li>
        <li>✔ Controle financeiro</li>
        <li>✔ Estoque completo</li>
        <li>✔ PDF profissional</li>
        <li>✔ Relatórios</li>
        <li>✔ WhatsApp integrado</li>
        <li>✔ 7 dias grátis</li>
      </ul>

      <Link
  to="/login?plano=premium"
  onClick={() => localStorage.setItem("planoSelecionado", "premium")}
  className="primary-btn full"
>
  Assinar agora
</Link>

<small>7 dias grátis • Sem cartão</small>
    </div>

    {/* Enterprise */}
    <div className="plano-card">
      <h3>Enterprise</h3>

      <div className="plano-preco">
        <strong>R$ 99,90</strong>
        <span>/mês</span>
      </div>

      <ul>
        <li>✔ Multi usuários</li>
        <li>✔ Multi lojas</li>
        <li>✔ Tudo ilimitado</li>
        <li>✔ Prioridade suporte</li>
        <li>✔ Recursos exclusivos</li>
        <li>✔ Futuras integrações</li>
      </ul>

      <Link
  to="/login?plano=enterprise"
  onClick={() => localStorage.setItem("planoSelecionado", "enterprise")}
  className="secondary-btn full"
>
  Assinar enterprise
</Link>
    </div>

  </div>
</section>

      <section className="depoimentos">
  <h2>O que lojas de assistência ganham com o OrdemTech</h2>

  <div className="depoimentos-grid">
    <div className="depoimento-card">
      <p>
        “Antes eu me perdia nas ordens em papel. Agora consigo acompanhar tudo pelo sistema.”
      </p>
      <strong>Assistência Técnica</strong>
      <span>Loja de celulares</span>
    </div>

    <div className="depoimento-card">
      <p>
        “O dashboard ajudou muito a enxergar vendas, estoque e serviços pendentes.”
      </p>
      <strong>Loja de Celulares</strong>
      <span>Controle completo</span>
    </div>

    <div className="depoimento-card">
      <p>
        “O PDF da ordem deixou o atendimento muito mais profissional.”
      </p>
      <strong>Técnico Independente</strong>
      <span>Mais organização</span>
    </div>
  </div>
</section>

      {/* FAQ */}

<section className="faq">

  <h2>Perguntas frequentes</h2>

  <div className="faq-grid">

    <div className="faq-card">
      <h3>
        Preciso instalar algum programa?
      </h3>

      <p>
        Não. O OrdemTech funciona totalmente online
        pelo navegador do computador ou celular.
      </p>
    </div>

    <div className="faq-card">
      <h3>
        Posso testar gratuitamente?
      </h3>

      <p>
        Sim. Você recebe 7 dias grátis para testar
        todas as funcionalidades do sistema.
      </p>
    </div>

    <div className="faq-card">
      <h3>
        Funciona no celular?
      </h3>

      <p>
        Sim. O sistema é totalmente responsivo
        e pode ser acessado pelo celular.
      </p>
    </div>

    <div className="faq-card">
      <h3>
        O sistema gera PDF?
      </h3>

      <p>
        Sim. Você consegue gerar ordens de serviço
        profissionais em PDF.
      </p>
    </div>

    <div className="faq-card">
      <h3>
        Posso usar em mais de uma loja?
      </h3>

      <p>
        Em breve teremos planos para múltiplas lojas
        e funcionários.
      </p>
    </div>

    <div className="faq-card">
      <h3>
        Os dados ficam seguros?
      </h3>

      <p>
        Sim. O sistema possui autenticação segura
        e proteção de dados.
      </p>
    </div>

  </div>

</section>

      {/* CTA */}

      <section className="cta">
  <div className="cta-box">

    <div className="cta-left">
      <h2>Transforme sua assistência técnica hoje</h2>

      <p>
        Organize ordens, clientes, estoque e financeiro
        em um único sistema profissional.
      </p>
    </div>

    <div className="cta-buttons">
      <a href="/login" className="primary-btn">
        Testar grátis
      </a>

      <a href="#planos" className="secondary-btn">
        Ver planos
      </a>
    </div>

  </div>
</section>
            <footer className="footer">
        <div className="footer-brand">
          <h3>OrdemTech</h3>
          <p>Sistema completo para assistências técnicas.</p>
        </div>

        <div className="footer-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#planos">Planos</a>
          <Link to="/login">Entrar</Link>
        </div>

        <div className="footer-copy">
          © 2026 OrdemTech. Todos os direitos reservados.
        </div>
      </footer>

      <Link to="/login" className="mobile-fixed-cta">
        Testar grátis
      </Link>

    </div>
  )
}

export default Home
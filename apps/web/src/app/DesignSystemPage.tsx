import { ArrowLeft, ArrowRight, BrainCircuit, Check, Code2, Search } from 'lucide-react';

const colors = [
  { name: 'Fundo', value: '#0F1216', className: 'color-bg' },
  { name: 'Superfície', value: '#181C23', className: 'color-surface' },
  { name: 'Elevado', value: '#282C33', className: 'color-raised' },
  { name: 'Primária', value: '#A6F750', className: 'color-primary' },
  { name: 'Texto', value: '#E1E1E1', className: 'color-text' },
  { name: 'Informação', value: '#67E8F9', className: 'color-info' },
  { name: 'Aviso', value: '#FFD166', className: 'color-warning' },
  { name: 'Perigo', value: '#FF6B81', className: 'color-danger' },
];

export function DesignSystemPage() {
  return (
    <div className="design-page">
      <header className="design-header">
        <a href={import.meta.env.BASE_URL} className="text-button">
          <ArrowLeft size={16} /> Voltar ao DevSpin
        </a>
        <span className="status-pill">Fase 1 · fundação</span>
      </header>
      <main id="conteudo-principal">
        <section className="design-intro">
          <span className="section-kicker">DEVSPIN DESIGN SYSTEM / 0.1</span>
          <h1>
            Uma interface técnica,
            <br />
            <span>sem perder o pulso humano.</span>
          </h1>
          <p>Tokens e componentes fundamentais usados no primeiro incremento visual.</p>
        </section>

        <section className="design-section">
          <div className="design-section-title">
            <span>01</span>
            <h2>Cores</h2>
          </div>
          <div className="color-grid">
            {colors.map(({ name, value, className }) => (
              <div className="color-card" key={value}>
                <div className={className} />
                <strong>{name}</strong>
                <code>{value}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="design-section">
          <div className="design-section-title">
            <span>02</span>
            <h2>Tipografia</h2>
          </div>
          <div className="type-samples">
            <div>
              <small>UBUNTU · DISPLAY</small>
              <h3>Conhecimento em movimento.</h3>
            </div>
            <div>
              <small>LATO · INTERFACE</small>
              <p>Clareza para ler, agir e continuar aprendendo.</p>
            </div>
            <div>
              <small>FIRA CODE · TÉCNICO</small>
              <code>const curiosidade = aprender();</code>
            </div>
          </div>
        </section>

        <section className="design-section">
          <div className="design-section-title">
            <span>03</span>
            <h2>Componentes</h2>
          </div>
          <div className="component-showcase">
            <div className="showcase-block">
              <small>BOTÕES</small>
              <div className="inline-demo">
                <button className="primary-button" type="button">
                  Continuar <ArrowRight size={17} />
                </button>
                <button className="secondary-button" type="button">
                  <Check size={17} /> Concluído
                </button>
                <button className="primary-button" type="button" disabled>
                  Indisponível
                </button>
              </div>
            </div>
            <div className="showcase-block">
              <small>TRILHAS</small>
              <div className="inline-demo">
                <button className="track-pill" type="button">
                  <Code2 size={20} /> Python
                </button>
                <button className="track-pill selected" type="button">
                  <BrainCircuit size={20} /> IA &amp; ML
                </button>
              </div>
            </div>
            <div className="showcase-block">
              <small>INPUT</small>
              <label className="demo-input">
                <Search size={17} />
                <span className="sr-only">Buscar</span>
                <input placeholder="Buscar conceito" />
              </label>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>DevSpin Design System</span>
        <span>Desenvolvido por Agatha Lafaiety</span>
      </footer>
    </div>
  );
}

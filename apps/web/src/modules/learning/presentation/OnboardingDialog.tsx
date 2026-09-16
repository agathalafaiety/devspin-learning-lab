import { useEffect, useRef } from 'react';
import { BrainCircuit, CheckCircle2, MousePointerClick, RotateCw, X } from 'lucide-react';

interface OnboardingDialogProps {
  onClose: () => void;
}

const steps = [
  {
    icon: MousePointerClick,
    title: 'Escolha seu foco',
    description: 'Selecione uma área e o nível que deseja praticar.',
  },
  {
    icon: RotateCw,
    title: 'Gire um conteúdo',
    description: 'Explore todos os itens do ciclo sem repetições.',
  },
  {
    icon: CheckCircle2,
    title: 'Teste e revise',
    description: 'Responda ao quiz, conclua a sessão e acompanhe sua evolução.',
  },
] as const;

export function OnboardingDialog({ onClose }: OnboardingDialogProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="focus-backdrop onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <section className="onboarding-modal">
        <button
          type="button"
          className="focus-close"
          onClick={onClose}
          aria-label="Pular introdução"
        >
          <X size={21} />
        </button>
        <div className="onboarding-glyph" aria-hidden="true">
          <BrainCircuit size={30} />
        </div>
        <span className="section-kicker">BEM-VINDA AO DEVSPIN</span>
        <h2 id="onboarding-title">Comece com três pequenos giros</h2>
        <p>Uma rotina simples para transformar curiosidade em prática constante.</p>

        <ol>
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <span>{index + 1}</span>
              <Icon size={20} aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            </li>
          ))}
        </ol>

        <button
          ref={startButtonRef}
          type="button"
          className="spin-primary onboarding-start"
          onClick={onClose}
        >
          Começar a explorar
        </button>
      </section>
    </div>
  );
}

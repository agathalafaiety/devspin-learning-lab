import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, CalendarDays, ChevronRight } from 'lucide-react';
import { Header } from '../shared/components/Header';
import { Footer } from '../shared/components/Footer';
import { FocusTimer } from '../modules/learning/presentation/FocusTimer';
import { SpinCore } from '../modules/learning/presentation/SpinCore';
import { TrackSelector } from '../modules/learning/presentation/TrackSelector';
import { AssessmentDialog } from '../modules/learning/presentation/AssessmentDialog';
import { ProgressDialog } from '../modules/learning/presentation/ProgressDialog';
import { ReviewPanel } from '../modules/learning/presentation/ReviewPanel';
import { OnboardingDialog } from '../modules/learning/presentation/OnboardingDialog';
import type { ReviewCandidate } from '../modules/learning/presentation/ReviewPanel';
import { drawLearningItem } from '../modules/learning/domain/catalog';
import type {
  Category,
  ChallengeItem,
  ConceptItem,
  LearningFilters,
  LearningItem,
  LearningMode,
  Level,
} from '../modules/learning/domain/types';
import { challenges, concepts } from '../modules/learning/infrastructure/content';
import { AudioFeedback } from '../shared/audio/audio-service';
import type { AudioPreferences, SoundCue } from '../shared/audio/audio-service';
import {
  assessmentLabels,
  calculateProgressStats,
  clearLearningProgress,
  countDueReviews,
  getItemKey,
  getItemType,
  recordAssessment,
  recordQuizAttempt,
  toggleFavorite,
} from '../modules/learning/domain/progress';
import type { SelfAssessment } from '../modules/learning/domain/progress';
import {
  loadProgress,
  parseProgressBackup,
  saveProgress,
  serializeProgressBackup,
} from '../modules/learning/infrastructure/local-progress';

interface ActiveTimer {
  stage: 'work' | 'explain';
  startedAtMs: number;
  item: LearningItem;
}

const allItems: LearningItem[] = [...concepts, ...challenges];
const itemByKey = new Map(allItems.map((item) => [getItemKey(item), item]));
const ONBOARDING_STORAGE_KEY = 'devspin.onboarding.v1';

function shouldShowOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'complete';
  } catch {
    return true;
  }
}

function completeOnboarding() {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'complete');
  } catch {
    // A introdução continua dispensável mesmo sem armazenamento disponível.
  }
}

function Home() {
  const [mode, setMode] = useState<LearningMode>('explore');
  const [categories, setCategories] = useState<Category[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [concept, setConcept] = useState<ConceptItem>(concepts[0]!);
  const [challenge, setChallenge] = useState<ChallengeItem>(challenges[0]!);
  const [noResult, setNoResult] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [pendingAssessment, setPendingAssessment] = useState<LearningItem | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(shouldShowOnboarding);
  const [progress, setProgress] = useState(loadProgress);
  const audio = useRef(new AudioFeedback());
  const drawCycles = useRef(new Map<string, string[]>());

  const filters = useMemo<LearningFilters>(() => ({ categories, level }), [categories, level]);
  const activeItem = mode === 'execute' ? challenge : concept;
  const activeItemKey = getItemKey(activeItem);
  const audioPreferences = progress.preferences.audio;
  const activeReview = progress.reviews.find((entry) => entry.itemKey === activeItemKey);
  const dueReviewCount = countDueReviews(progress.reviews);
  const favoriteItems = progress.favoriteKeys
    .map((key) => itemByKey.get(key))
    .filter((item): item is LearningItem => Boolean(item));
  const reviewCandidates = progress.reviews
    .map((entry) => {
      const item = itemByKey.get(entry.itemKey);
      return item ? ({ entry, item } satisfies ReviewCandidate) : null;
    })
    .filter((candidate): candidate is ReviewCandidate => candidate !== null);
  const progressStats = useMemo(() => calculateProgressStats(progress, allItems), [progress]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const play = (cue: SoundCue) => audio.current.play(cue, audioPreferences);

  const changeMode = (nextMode: LearningMode) => {
    setMode(nextMode);
    setNoResult(false);
    play('action');
    if (nextMode !== 'review') drawWithFilters(filters, nextMode);
  };

  const drawWithFilters = (
    nextFilters: LearningFilters,
    targetMode: Exclude<LearningMode, 'review'> = mode === 'review' ? 'explore' : mode,
  ) => {
    const cycleKey = [
      targetMode,
      [...nextFilters.categories].sort().join(','),
      nextFilters.level ?? 'all',
    ].join(':');
    const result =
      targetMode === 'explore'
        ? drawLearningItem(concepts, nextFilters, concept.id, drawCycles.current.get(cycleKey))
        : drawLearningItem(challenges, nextFilters, challenge.id, drawCycles.current.get(cycleKey));

    if (!result) {
      setNoResult(true);
      return;
    }

    drawCycles.current.set(cycleKey, result.seenIds);
    setNoResult(false);
    setIsSpinning(true);
    play('spin');
    window.setTimeout(() => {
      if (targetMode === 'explore') setConcept(result.item as ConceptItem);
      else setChallenge(result.item as ChallengeItem);
      setIsSpinning(false);
      play('result');
    }, 680);
  };

  const draw = () => drawWithFilters(filters);

  const updateAudioPreferences = (next: AudioPreferences) => {
    setProgress((current) => ({
      ...current,
      preferences: { ...current.preferences, audio: next },
    }));
  };

  const toggleItemFavorite = (item: LearningItem) => {
    setProgress((current) => toggleFavorite(current, getItemKey(item)));
    play('action');
  };

  const assessItem = (
    item: LearningItem,
    assessment: SelfAssessment,
    source: 'session' | 'review',
  ) => {
    setProgress((current) => recordAssessment(current, item, assessment, source));
    setPendingAssessment(null);
    play('complete');
  };

  const openSavedItem = (item: LearningItem) => {
    if (getItemType(item) === 'concept') {
      setConcept(item as ConceptItem);
      setMode('explore');
    } else {
      setChallenge(item as ChallengeItem);
      setMode('execute');
    }
    setNoResult(false);
    setProgressOpen(false);
  };

  const exportProgress = () => {
    const blob = new Blob([serializeProgressBackup(progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devspin-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    play('complete');
  };

  const importProgress = async (file: File) => {
    try {
      if (file.size > 1_000_000) {
        throw new Error('O backup excede o limite de 1 MB.');
      }
      const imported = parseProgressBackup(await file.text());
      setProgress(imported);
      play('complete');
      return { ok: true, message: 'Backup importado com sucesso.' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Não foi possível importar o backup.',
      };
    }
  };

  return (
    <div className="app-shell">
      <Header
        mode={mode}
        onModeChange={changeMode}
        audioPreferences={audioPreferences}
        onAudioPreferencesChange={updateAudioPreferences}
      />

      <main id="conteudo-principal" className="home-main mvp-main">
        <div className="ambient-copy ambient-left" aria-hidden="true">
          <span>APRENDER</span>
          <span>CONSTRUIR</span>
          <span>EVOLUIR</span>
        </div>
        <div className="ambient-copy ambient-right" aria-hidden="true">
          <span>PYTHON</span>
          <span>SQL</span>
          <span>BACKEND</span>
          <span>INTELIGÊNCIA ARTIFICIAL</span>
          <span>CIÊNCIA DE DADOS</span>
        </div>

        <section className="mvp-intro" aria-labelledby="hero-title">
          <span className="mvp-kicker">APRENDA · PRATIQUE · EXPLIQUE · REVISE</span>
          <h1 id="hero-title">
            {mode === 'review'
              ? 'O que você consegue recordar hoje?'
              : 'O que você quer dominar hoje?'}
          </h1>
          {mode === 'review' ? (
            <p className="review-intro-note">
              Sua fila é organizada pelas autoavaliações e fica somente neste dispositivo.
            </p>
          ) : (
            <TrackSelector
              selectedCategories={categories}
              selectedLevel={level}
              onSelectCategories={(nextCategories) => {
                setCategories(nextCategories);
                drawWithFilters({ categories: nextCategories, level });
              }}
              onLevelChange={(nextLevel) => {
                setLevel(nextLevel);
                drawWithFilters({ categories, level: nextLevel });
              }}
            />
          )}
        </section>

        {mode === 'review' ? (
          <ReviewPanel
            candidates={reviewCandidates}
            onAssess={(item, assessment) => assessItem(item, assessment, 'review')}
          />
        ) : (
          <SpinCore
            key={activeItemKey}
            mode={mode}
            item={activeItem}
            isSpinning={isSpinning}
            noResult={noResult}
            onDraw={draw}
            isFavorite={progress.favoriteKeys.includes(activeItemKey)}
            lastAssessmentLabel={activeReview ? assessmentLabels[activeReview.assessment] : null}
            onToggleFavorite={() => toggleItemFavorite(activeItem)}
            onQuizAnswered={(questionId, correct) => {
              setProgress((current) => recordQuizAttempt(current, activeItem, questionId, correct));
            }}
            onStart={() => {
              setActiveTimer({ stage: 'work', startedAtMs: Date.now(), item: activeItem });
              play('action');
            }}
            onExplain={() => {
              setActiveTimer({ stage: 'explain', startedAtMs: Date.now(), item: activeItem });
              play('action');
            }}
          />
        )}

        <section className="mvp-stats" aria-label="Atalhos de progresso local">
          <button
            type="button"
            className="progress-shortcut pending"
            onClick={() => changeMode('review')}
          >
            <CalendarDays size={24} aria-hidden="true" />
            <span>
              <strong>
                {dueReviewCount === 0
                  ? 'Nenhuma revisão pendente'
                  : `${dueReviewCount} ${dueReviewCount === 1 ? 'revisão pendente' : 'revisões pendentes'}`}
              </strong>
              <small>
                {progress.reviews.length === 0
                  ? 'Conclua uma sessão para iniciar sua fila'
                  : `${progress.reviews.length} ${progress.reviews.length === 1 ? 'item agendado' : 'itens agendados'}`}
              </small>
            </span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="progress-shortcut saved"
            onClick={() => setProgressOpen(true)}
          >
            <Bookmark size={24} aria-hidden="true" />
            <span>
              <strong>
                {favoriteItems.length} {favoriteItems.length === 1 ? 'item salvo' : 'itens salvos'}
              </strong>
              <small>{progress.history.length} atividades no histórico local</small>
            </span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </section>

        <p className="mvp-motto">
          <span /> PEQUENOS GIROS · GRANDES DESENVOLVEDORES <span />
        </p>
      </main>

      <Footer />

      {onboardingOpen && (
        <OnboardingDialog
          onClose={() => {
            completeOnboarding();
            setOnboardingOpen(false);
          }}
        />
      )}

      {activeTimer && (
        <FocusTimer
          key={`${activeTimer.item.id}-${activeTimer.stage}-${activeTimer.startedAtMs}`}
          itemTitle={activeTimer.item.title}
          stage={activeTimer.stage}
          startedAtMs={activeTimer.startedAtMs}
          durationMinutes={activeTimer.stage === 'work' ? 30 : 15}
          onCue={play}
          onClose={() => setActiveTimer(null)}
          onComplete={() => {
            if (activeTimer.stage === 'work') {
              play('complete');
              setActiveTimer({
                stage: 'explain',
                startedAtMs: Date.now(),
                item: activeTimer.item,
              });
            } else {
              setPendingAssessment(activeTimer.item);
              setActiveTimer(null);
            }
          }}
        />
      )}

      {pendingAssessment && (
        <AssessmentDialog
          item={pendingAssessment}
          isFavorite={progress.favoriteKeys.includes(getItemKey(pendingAssessment))}
          onToggleFavorite={() => toggleItemFavorite(pendingAssessment)}
          onSelect={(assessment) => assessItem(pendingAssessment, assessment, 'session')}
          onClose={() => setPendingAssessment(null)}
        />
      )}

      {progressOpen && (
        <ProgressDialog
          favoriteItems={favoriteItems}
          history={progress.history}
          stats={progressStats}
          onOpenItem={openSavedItem}
          onRemoveFavorite={toggleItemFavorite}
          onExport={exportProgress}
          onImport={importProgress}
          onClearProgress={() => {
            setProgress((current) => clearLearningProgress(current));
            play('action');
          }}
          onClose={() => setProgressOpen(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return <Home />;
}

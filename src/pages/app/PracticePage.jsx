import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2,
  BookOpen,
  Timer,
  Keyboard,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronDown,
  Shuffle,
  FileText,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  X,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import { TypingEngine } from '../../components/typing/TypingEngine.jsx';
import { ResultsCard } from '../../components/typing/ResultsCard.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

const GUEST_COMPLETED_KEY = 'codetyper_completed_lessons';

export function PracticePage({
  initialType = 'practice',
  initialLanguage = null,
  onNavigate
}) {
  const { user, updateUserStats } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  // Mode and filter states
  const [practiceType, setPracticeType] = useState(initialType);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || settings.default_language || 'JavaScript');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mode, setMode] = useState(initialType === 'test' ? 'time' : 'time');
  const [duration, setDuration] = useState(initialType === 'test' ? 60 : 30);
  const [wordCount, setWordCount] = useState(25);

  // Content & Curriculum state
  const [contentList, setContentList] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  // Completed lesson IDs (stored in localStorage for guest, DB for authenticated)
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Result state
  const [completedResult, setCompletedResult] = useState(null);
  const [engineKey, setEngineKey] = useState(Date.now());

  // Sync when initialType changes from sidebar
  useEffect(() => {
    if (initialType) {
      setPracticeType(initialType);
      setCompletedResult(null);
      if (initialType === 'test') {
        setDuration(60);
        setMode('time');
      }
    }
  }, [initialType]);

  const isCode = practiceType === 'coding';
  const isTest = practiceType === 'test';

  // Load content from API
  const fetchContent = useCallback(async (preferredSnippetId = null) => {
    setLoadingContent(true);
    try {
      const params = {};
      if (practiceType === 'coding') {
        params.type = 'code';
        if (selectedLanguage && selectedLanguage !== 'All') {
          params.language = selectedLanguage;
        }
      } else if (practiceType === 'english') {
        params.type = 'english';
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
      } else if (practiceType === 'test') {
        params.type = 'english'; // Default test on English or mix
      }

      if (selectedDifficulty && selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty;
      }

      const res = await api.practice.getContent(params);
      const items = res.items || (res.item ? [res.item] : []);
      setContentList(items);

      // Merge server completed lesson IDs with local storage
      if (Array.isArray(res.completedLessonIds)) {
        setCompletedLessonIds((prev) => {
          const merged = Array.from(new Set([...prev, ...res.completedLessonIds]));
          try {
            localStorage.setItem(GUEST_COMPLETED_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      if (items.length > 0) {
        if (preferredSnippetId) {
          const found = items.find((it) => it.id === preferredSnippetId);
          setCurrentSnippet(found || items[0]);
        } else if (res.item) {
          setCurrentSnippet(res.item);
        } else {
          setCurrentSnippet(items[0]);
        }
      } else {
        // Fallback default text if server returns empty list
        setCurrentSnippet({
          id: null,
          title: isCode ? `${selectedLanguage} Function Practice` : 'Focused Typing Discipline',
          language: isCode ? selectedLanguage : 'English',
          difficulty: 'intermediate',
          content: isCode
            ? `function calculateVelocity(distance, time) {\n  if (time <= 0) return 0;\n  const speed = distance / time;\n  return Number(speed.toFixed(2));\n}`
            : 'Typing with consistent rhythm and deliberate calmness prevents muscle fatigue. Keep your shoulders relaxed, breathe evenly, and let muscle memory guide your fingers across the keyboard.'
        });
      }
    } catch (err) {
      console.warn('Failed to fetch practice content', err);
      setCurrentSnippet({
        id: null,
        title: 'Calm Practice Session',
        language: 'English',
        difficulty: 'intermediate',
        content: 'Breathe deeply and find your focus. True mastery is built through relaxed consistency, deliberate keystrokes, and mindful repetition.'
      });
    } finally {
      setLoadingContent(false);
      setEngineKey(Date.now());
    }
  }, [practiceType, selectedLanguage, selectedCategory, selectedDifficulty, isCode]);

  useEffect(() => {
    if (!isCustomMode) {
      fetchContent();
    }
  }, [fetchContent, isCustomMode]);

  // Derived lesson & curriculum calculations
  const currentLessonIndex = contentList.findIndex((c) => c.id === currentSnippet?.id);
  const currentLessonNumber = currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1;
  const totalLessons = contentList.length;
  const completedCount = contentList.filter((c) => completedLessonIds.includes(c.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentCompleted = currentSnippet?.id && completedLessonIds.includes(currentSnippet.id);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex + 1 < contentList.length
    ? contentList[currentLessonIndex + 1]
    : null;
  const prevLesson = currentLessonIndex > 0
    ? contentList[currentLessonIndex - 1]
    : null;

  // Direct lesson selector
  const handleSelectLesson = (lesson) => {
    setCurrentSnippet(lesson);
    setCompletedResult(null);
    setEngineKey(Date.now());
    setShowCurriculumModal(false);
  };

  // Next lesson handler (sequential guided path)
  const handleNextSnippet = () => {
    if (nextLesson) {
      setCurrentSnippet(nextLesson);
      setCompletedResult(null);
      setEngineKey(Date.now());
    } else if (contentList.length > 1 && currentSnippet) {
      // If at end of curriculum or looped
      const remaining = contentList.filter((c) => c.id !== currentSnippet.id);
      const nextItem = remaining[Math.floor(Math.random() * remaining.length)];
      setCurrentSnippet(nextItem);
      setCompletedResult(null);
      setEngineKey(Date.now());
    } else {
      fetchContent();
    }
  };

  // Previous lesson handler
  const handlePrevSnippet = () => {
    if (prevLesson) {
      setCurrentSnippet(prevLesson);
      setCompletedResult(null);
      setEngineKey(Date.now());
    }
  };

  // Completion handler
  const handleSessionComplete = async (metrics) => {
    // Check if this counts as completing the lesson (accuracy >= 80%)
    const isPassing = metrics.accuracy >= 80;
    if (currentSnippet?.id && isPassing) {
      setCompletedLessonIds((prev) => {
        if (!prev.includes(currentSnippet.id)) {
          const updated = [...prev, currentSnippet.id];
          try {
            localStorage.setItem(GUEST_COMPLETED_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });
    }

    // Detect level up (e.g. from beginner to intermediate, or intermediate to advanced)
    let levelUpInfo = null;
    if (nextLesson && currentSnippet?.difficulty && nextLesson.difficulty) {
      if (currentSnippet.difficulty.toLowerCase() !== nextLesson.difficulty.toLowerCase()) {
        levelUpInfo = {
          from: currentSnippet.difficulty,
          to: nextLesson.difficulty
        };
      }
    }

    const isCourseComplete = (currentLessonIndex + 1 >= totalLessons) && isPassing;

    setCompletedResult({
      ...metrics,
      lessonNumber: currentLessonNumber,
      totalLessons,
      nextLesson,
      levelUpInfo,
      isCourseComplete
    });

    // Prepare payload for backend
    const sessionPayload = {
      content_id: currentSnippet?.id || null,
      practice_type: practiceType,
      language: currentSnippet?.language || (isCode ? selectedLanguage : 'English'),
      difficulty: currentSnippet?.difficulty || selectedDifficulty || 'intermediate',
      duration_seconds: metrics.durationSeconds,
      gross_wpm: metrics.grossWpm,
      net_wpm: metrics.netWpm,
      accuracy: metrics.accuracy,
      total_characters: metrics.totalChars,
      correct_characters: metrics.correctChars,
      incorrect_characters: metrics.incorrectChars,
      error_count: metrics.errorCount,
      raw_timeline_json: metrics.timeline || []
    };

    if (user) {
      try {
        const response = await api.sessions.save(sessionPayload);
        if (response.statistics) {
          updateUserStats(response.statistics);
        }
        toast.success(`Lesson recorded! Speed: ${metrics.netWpm} WPM (${metrics.accuracy}% acc)`);
      } catch (err) {
        console.error('Failed to save session to server', err);
        toast.warning('Session completed. Offline queue saved.');
      }
    } else {
      toast.info('Sign up or log in to permanently save your progress and sync across devices.');
    }
  };

  const handleApplyCustomText = () => {
    if (!customText.trim()) {
      toast.error('Please enter some text or code to practice.');
      return;
    }
    setIsCustomMode(true);
    setCurrentSnippet({
      id: null,
      title: 'Custom Practice Passage',
      language: isCode ? selectedLanguage : 'Custom',
      difficulty: 'custom',
      content: customText.trim()
    });
    setShowCustomModal(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success('Custom passage loaded.');
  };

  const targetText = currentSnippet?.content || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Header & Mode Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {practiceType === 'coding' && <Code2 size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'english' && <BookOpen size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'test' && <Timer size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'practice' && <Keyboard size={22} color="var(--color-primary-forest)" />}
            <h1 style={{ fontSize: '1.75rem', margin: 0, textTransform: 'capitalize' }}>
              {practiceType === 'coding' && 'Coding Practice'}
              {practiceType === 'english' && 'English Practice'}
              {practiceType === 'test' && 'Typing Speed Test'}
              {practiceType === 'practice' && 'Quick Practice'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            {practiceType === 'coding' && 'Refine muscle memory for syntactical punctuation, indentation, and logic.'}
            {practiceType === 'english' && 'Cultivate fluid cadence, common word flows, and high accuracy.'}
            {practiceType === 'test' && 'Standardized timed test under exam conditions to establish your rating.'}
            {practiceType === 'practice' && 'Distraction-free everyday typing warm-up.'}
          </p>
        </div>

        {/* Practice Mode Switcher Pills */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <button
            className={`btn btn-sm ${practiceType === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('practice'); setCompletedResult(null); }}
          >
            <Keyboard size={15} />
            <span>Quick</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'coding' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('coding'); setCompletedResult(null); }}
          >
            <Code2 size={15} />
            <span>Coding</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'english' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('english'); setCompletedResult(null); }}
          >
            <BookOpen size={15} />
            <span>English</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'test' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('test'); setDuration(60); setMode('time'); setCompletedResult(null); }}
          >
            <Timer size={15} />
            <span>Speed Test</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Languages, Difficulty, Timer */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Coding Language Dropdown */}
          {practiceType === 'coding' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Language:</span>
              <select
                className="input"
                style={{ padding: '0.4rem 0.75rem', width: 'auto', minWidth: '140px', fontSize: '0.875rem' }}
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                {programmingLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* English Category Dropdown */}
          {practiceType === 'english' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category:</span>
              <select
                className="input"
                style={{ padding: '0.4rem 0.75rem', width: 'auto', minWidth: '150px', fontSize: '0.875rem' }}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                <option value="All">All Categories</option>
                {englishCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>
              Level:
            </span>
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm ${selectedDifficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize', padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setSelectedDifficulty(lvl);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Right side controls: Mode, Duration, Shuffle, Custom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Mode Switcher: Time vs Words vs Complete Passage */}
          {!isTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                className={`btn btn-sm ${mode === 'time' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('time')}
                title="Time-based countdown"
              >
                Time
              </button>
              <button
                className={`btn btn-sm ${mode === 'words' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('words')}
                title="Fixed word count"
              >
                Words
              </button>
              <button
                className={`btn btn-sm ${mode === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('text')}
                title="Complete full snippet"
              >
                Passage
              </button>
            </div>
          )}

          {/* Duration selectors */}
          {mode === 'time' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {(isTest ? [30, 60, 120, 300] : [15, 30, 60, 120]).map((sec) => (
                <button
                  key={sec}
                  className={`btn btn-sm ${duration === sec ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '38px' }}
                  onClick={() => { setDuration(sec); setCompletedResult(null); setEngineKey(Date.now()); }}
                >
                  {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          )}

          {/* Word count selectors */}
          {mode === 'words' && !isTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[10, 25, 50, 100].map((w) => (
                <button
                  key={w}
                  className={`btn btn-sm ${wordCount === w ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '36px' }}
                  onClick={() => { setWordCount(w); setCompletedResult(null); setEngineKey(Date.now()); }}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {/* Shuffle / Next Snippet */}
          <button
            className="btn btn-outline btn-sm"
            onClick={handleNextSnippet}
            title="Load another passage"
          >
            <Shuffle size={14} />
            <span>Next</span>
          </button>

          {/* Custom text button */}
          <button
            className={`btn btn-sm ${isCustomMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowCustomModal(true)}
            title="Paste custom text or code"
          >
            <FileText size={14} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Lesson Curriculum & Level Progression Bar */}
      {!isCustomMode && !isTest && totalLessons > 0 && (
        <div
          className="card"
          style={{
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-primary-forest)'
          }}
        >
          {/* Left: Lesson Number, Title & Level Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              className="badge badge-forest"
              style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.3rem 0.65rem' }}
            >
              Lesson {currentLessonNumber} of {totalLessons}
            </span>

            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
              {currentSnippet?.title || 'Focused Practice'}
            </span>

            <span
              className={`badge ${
                currentSnippet?.difficulty === 'beginner'
                  ? 'badge-sage'
                  : currentSnippet?.difficulty === 'intermediate'
                  ? 'badge-sand'
                  : 'badge-terracotta'
              }`}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
            >
              {currentSnippet?.difficulty || 'Practice'}
            </span>

            {isCurrentCompleted && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--color-primary-forest)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={15} />
                <span>Completed</span>
              </span>
            )}
          </div>

          {/* Right: Progress % Bar & Prev / Next Navigation & All Lessons Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span>Curriculum Progress</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}>
                  {completedCount}/{totalLessons} ({progressPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--color-bg-soft)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary-forest)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Quick Prev / Next Arrows */}
            <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={!prevLesson}
                onClick={handlePrevSnippet}
                title={prevLesson ? `Previous: Lesson ${currentLessonNumber - 1} (${prevLesson.title})` : 'First lesson'}
                style={{ padding: '0.35rem 0.55rem' }}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={!nextLesson}
                onClick={handleNextSnippet}
                title={nextLesson ? `Next: Lesson ${currentLessonNumber + 1} (${nextLesson.title})` : 'Last lesson'}
                style={{ padding: '0.35rem 0.55rem' }}
              >
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Curriculum Modal Trigger */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCurriculumModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <ListOrdered size={15} />
              <span>All Lessons ({totalLessons})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Practice Surface */}
      {completedResult ? (
        <ResultsCard
          result={completedResult}
          onTryAgain={() => {
            setCompletedResult(null);
            setEngineKey(Date.now());
          }}
          onNextPractice={handleNextSnippet}
          onNavigate={onNavigate}
        />
      ) : loadingContent ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Preparing your calm typing environment...</p>
        </div>
      ) : (
        <TypingEngine
          key={engineKey}
          targetText={targetText}
          title={currentSnippet?.title || 'Focused Practice'}
          language={currentSnippet?.language || (isCode ? selectedLanguage : 'English')}
          difficulty={currentSnippet?.difficulty || selectedDifficulty}
          isCode={isCode}
          mode={mode}
          duration={duration}
          onComplete={handleSessionComplete}
        />
      )}

      {/* Custom Text Modal */}
      {showCustomModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Paste Custom Practice Text</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Paste your own code excerpt, documentation paragraph, or study notes to practice typing custom content.
            </p>

            <textarea
              className="input"
              rows={8}
              placeholder="Paste code or text here..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1.25rem', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowCustomModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApplyCustomText}>
                Load Custom Passage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum / All Lessons Modal */}
      {showCurriculumModal && (
        <div className="modal-backdrop" onClick={() => setShowCurriculumModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={20} color="var(--color-primary-forest)" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                    {isCode ? `${selectedLanguage} Curriculum` : `${selectedCategory} Lessons`}
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Structured lesson progression from Beginner to Advanced. Select any lesson or continue in sequence.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowCurriculumModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Curriculum Stats Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Total Lessons: <strong style={{ color: 'var(--color-text-primary)' }}>{totalLessons}</strong>
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Completed: <strong style={{ color: 'var(--color-primary-forest)' }}>{completedCount} of {totalLessons} ({progressPercent}%)</strong>
              </span>
            </div>

            {/* Lessons List */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '0.25rem' }}>
              {contentList.map((lesson, idx) => {
                const isSelected = lesson.id === currentSnippet?.id;
                const isCompleted = completedLessonIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id || idx}
                    onClick={() => handleSelectLesson(lesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '1.5px solid var(--color-primary-forest)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-bg-surface)'
                        : 'var(--color-bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: isCompleted
                            ? 'var(--color-primary-forest)'
                            : isSelected
                            ? 'var(--color-primary-sage)'
                            : 'var(--color-bg-soft)',
                          color: isCompleted
                            ? '#ffffff'
                            : isSelected
                            ? '#ffffff'
                            : 'var(--color-text-secondary)'
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                            {lesson.title}
                          </span>
                          <span
                            className={`badge ${
                              lesson.difficulty === 'beginner'
                                ? 'badge-sage'
                                : lesson.difficulty === 'intermediate'
                                ? 'badge-sand'
                                : 'badge-terracotta'
                            }`}
                            style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                          >
                            {lesson.difficulty}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {lesson.word_count || lesson.content?.split(/\s+/).length || 0} words • {lesson.char_count || lesson.content?.length || 0} chars
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>
                          Current
                        </span>
                      ) : isCompleted ? (
                        <span style={{ color: 'var(--color-primary-forest)', fontSize: '0.8rem', fontWeight: 600 }}>
                          Completed
                        </span>
                      ) : (
                        <span className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}>
                          Start →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCurriculumModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

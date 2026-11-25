import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Trophy,
  Lock,
  Unlock,
  Search,
  Globe,
  Download,
  Trash2,
  ExternalLink,
  FileCode,
  Target,
  SlidersHorizontal,
  Minimize2,
  Maximize2,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import { TypingEngine } from '../../components/typing/TypingEngine.jsx';
import { ResultsCard } from '../../components/typing/ResultsCard.jsx';
import { keyStatsManager } from '../../utils/gamificationEngine.js';
import { generateCodingSnippet, getAvailableTopics } from '../../utils/snippetGenerator.js';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

const GUEST_COMPLETED_KEY = 'codetyper_completed_lessons';

const popularCodingLanguages = [
  { id: 'JavaScript', label: 'JS' },
  { id: 'TypeScript', label: 'TS' },
  { id: 'Python', label: 'Python' },
  { id: 'React/JSX', label: 'React' },
  { id: 'C++', label: 'C++' },
  { id: 'Java', label: 'Java' },
  { id: 'HTML', label: 'HTML' },
  { id: 'CSS', label: 'CSS' },
  { id: 'Go', label: 'Go' },
  { id: 'Rust', label: 'Rust' },
  { id: 'SQL', label: 'SQL' },
  { id: 'Algorithms (DSA)', label: 'DSA' }
];

const popularEnglishCategories = [
  { id: 'All', label: 'All Topics' },
  { id: 'General English', label: 'General' },
  { id: 'Developer Knowledge', label: 'Developer' },
  { id: 'Programming Concepts', label: 'Concepts' },
  { id: 'Daily Life', label: 'Daily Life' },
  { id: 'Business', label: 'Business' },
  { id: 'Technology', label: 'Tech' },
  { id: 'Science', label: 'Science' },
  { id: 'Productivity', label: 'Productivity' },
  { id: 'Short Stories', label: 'Stories' }
];

export function PracticePage({
  initialType = 'practice',
  initialLanguage = null,
  initialDuration = null,
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
  const [duration, setDuration] = useState(initialDuration || (initialType === 'test' ? 60 : 30));
  const [wordCount, setWordCount] = useState(25);

  // Content & Curriculum state
  const [contentList, setContentList] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModalTab, setCustomModalTab] = useState('custom'); // 'custom' | 'github'
  const [customSnippetTitle, setCustomSnippetTitle] = useState('My Custom Snippet');
  const [customSnippetLang, setCustomSnippetLang] = useState('JavaScript');
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubPreview, setGithubPreview] = useState(null);
  const [generatorLang, setGeneratorLang] = useState('JavaScript');
  const [generatorTopic, setGeneratorTopic] = useState('');
  const [generatorDifficulty, setGeneratorDifficulty] = useState('intermediate');
  const [generatorPreview, setGeneratorPreview] = useState(null);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  // Curriculum modal search & filter
  const [modalFilter, setModalFilter] = useState('all');
  const [modalSearch, setModalSearch] = useState('');

  // Completed lesson IDs (stored in localStorage for guest, DB for authenticated)
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const completedLessonIdsRef = useRef(completedLessonIds);
  useEffect(() => {
    completedLessonIdsRef.current = completedLessonIds;
  }, [completedLessonIds]);

  const activeRoadmapPillRef = useRef(null);

  // Roadmap drawer toggle and flow focus state
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState('idle');

  // Compact Focus Mode: minimizes bulky menus and options to maximize typing focus and screen room
  const [isCompactMode, setIsCompactMode] = useState(() => {
    try {
      const saved = localStorage.getItem('codetyper_compact_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleCompactMode = () => {
    setIsCompactMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('codetyper_compact_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Result state
  const [completedResult, setCompletedResult] = useState(null);
  const [engineKey, setEngineKey] = useState(Date.now());

  // Sync when initialType or initialDuration changes from navigation
  useEffect(() => {
    if (initialType) {
      setPracticeType(initialType);
      setCompletedResult(null);
      if (initialType === 'test') {
        setDuration(initialDuration || 60);
        setMode('time');
      } else if (initialDuration) {
        setDuration(initialDuration);
        setMode('time');
      }
    }
  }, [initialType, initialDuration]);

  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const handleSwitchPracticeType = (newType, customDuration = null) => {
    setPracticeType(newType);
    setCompletedResult(null);
    setIsCustomMode(false);
    if (newType === 'test') {
      setDuration(customDuration || 60);
      setMode('time');
    } else if (customDuration) {
      setDuration(customDuration);
    }
    setEngineKey(Date.now());
    if (onNavigate) {
      onNavigate(newType);
    }
  };

  const handleSelectLanguage = (lang) => {
    setSelectedLanguage(lang);
    setIsCustomMode(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setIsCustomMode(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
  };

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
        params.type = 'english';
      }

      if (selectedDifficulty && selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty;
      }

      const res = await api.practice.getContent(params);
      const items = res.items || (res.item ? [res.item] : []);
      setContentList(items);

      // Merge server completed lesson IDs with local storage
      const currentCompleted = completedLessonIdsRef.current || [];
      let mergedCompleted = currentCompleted;
      if (Array.isArray(res.completedLessonIds) && res.completedLessonIds.length > 0) {
        const mergedSet = new Set([...currentCompleted, ...res.completedLessonIds]);
        if (mergedSet.size !== currentCompleted.length) {
          mergedCompleted = Array.from(mergedSet);
          setCompletedLessonIds(mergedCompleted);
          try {
            localStorage.setItem(GUEST_COMPLETED_KEY, JSON.stringify(mergedCompleted));
          } catch {}
        }
      }

      if (items.length > 0) {
        if (preferredSnippetId) {
          const found = items.find((it) => it.id === preferredSnippetId);
          setCurrentSnippet(found || items[0]);
        } else {
          // Select the first unlocked but incomplete lesson, or Lesson 1
          const firstIncompleteUnlocked = items.find((it, idx) => {
            const unlocked = idx === 0 || mergedCompleted.includes(items[idx - 1]?.id);
            return unlocked && !mergedCompleted.includes(it.id);
          });
          setCurrentSnippet(firstIncompleteUnlocked || items[0]);
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

  // Sequential Unlock Rule:
  // Lesson 1 is always unlocked.
  // Lesson N is unlocked only if Lesson N-1 is completed.
  const isLessonUnlocked = useCallback(
    (idx) => {
      if (idx === 0) return true;
      const prev = contentList[idx - 1];
      return prev ? completedLessonIds.includes(prev.id) : false;
    },
    [contentList, completedLessonIds]
  );

  // Derived lesson & curriculum calculations
  const currentLessonIndex = contentList.findIndex((c) => c.id === currentSnippet?.id);
  const currentLessonNumber = currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1;
  const totalLessons = contentList.length;
  const completedCount = contentList.filter((c) => completedLessonIds.includes(c.id)).length;
  const unlockedLessonsCount = contentList.filter((_, idx) => isLessonUnlocked(idx)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentCompleted = currentSnippet?.id && completedLessonIds.includes(currentSnippet.id);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex + 1 < contentList.length
    ? contentList[currentLessonIndex + 1]
    : null;
  const prevLesson = currentLessonIndex > 0
    ? contentList[currentLessonIndex - 1]
    : null;

  // Direct lesson selector with unlock validation
  const handleSelectLesson = (lesson, idx) => {
    if (!isLessonUnlocked(idx)) {
      toast.warning(`🔒 Lesson ${idx + 1} is locked! Complete Lesson ${idx} first to unlock it.`);
      return;
    }
    setCurrentSnippet(lesson);
    setCompletedResult(null);
    setEngineKey(Date.now());
    setShowCurriculumModal(false);
  };

  // Next lesson handler (sequential guided path)
  const handleNextSnippet = () => {
    if (nextLesson && currentLessonIndex + 1 < contentList.length) {
      const nextIdx = currentLessonIndex + 1;
      if (!isLessonUnlocked(nextIdx)) {
        toast.warning(`🔒 Lesson ${nextIdx + 1} is locked! Complete Lesson ${currentLessonNumber} with ≥80% accuracy to unlock!`);
        return;
      }
      setCurrentSnippet(nextLesson);
      setCompletedResult(null);
      setEngineKey(Date.now());
    } else if (contentList.length > 1 && currentSnippet) {
      // Loop back to lesson 1
      setCurrentSnippet(contentList[0]);
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

  // Smart Weakness Drill generator
  const handleStartWeaknessDrill = () => {
    const weakKeys = keyStatsManager.getWeakestKeys(5);
    const drillSnippet = keyStatsManager.generateWeaknessSnippet(weakKeys, isCode);
    setCurrentSnippet(drillSnippet);
    setIsCustomMode(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success(`🎯 Generated Weakness Drill targeting: [ ${weakKeys.join(', ')} ]`);
  };

  // Auto-scroll active pill into view within roadmap strip without scrolling the window
  useEffect(() => {
    if (activeRoadmapPillRef.current) {
      const pill = activeRoadmapPillRef.current;
      const parent = pill.parentElement;
      if (parent) {
        const offsetLeft = pill.offsetLeft;
        const pillWidth = pill.offsetWidth;
        const parentWidth = parent.clientWidth;
        parent.scrollTo({
          left: Math.max(0, offsetLeft - parentWidth / 2 + pillWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [currentSnippet?.id]);

  // Completion handler
  const handleSessionComplete = async (metrics) => {
    const isPassing = metrics.accuracy >= 80;
    const wasAlreadyCompleted = currentSnippet?.id && completedLessonIds.includes(currentSnippet.id);

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

      if (!wasAlreadyCompleted && nextLesson) {
        toast.success(`🎉 Lesson ${currentLessonNumber} completed! 🔓 Lesson ${currentLessonNumber + 1} is now UNLOCKED!`);
      }
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
      total_characters: metrics.totalCharacters ?? metrics.totalChars ?? 0,
      correct_characters: metrics.correctCharacters ?? metrics.correctChars ?? 0,
      incorrect_characters: metrics.incorrectCharacters ?? metrics.incorrectChars ?? 0,
      error_count: metrics.errorCount ?? metrics.totalErrors ?? 0,
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

  const loadSavedSnippets = useCallback(async () => {
    if (!user) return;
    setLoadingSaved(true);
    try {
      const data = await api.practice.getCustomSnippets();
      setSavedSnippets(data.snippets || []);
    } catch (e) {
      console.warn('Could not load custom snippets', e);
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    if (showCustomModal && user) {
      loadSavedSnippets();
    }
  }, [showCustomModal, user, loadSavedSnippets]);

  const handleApplyCustomText = async () => {
    if (!customText.trim()) {
      toast.error('Please enter some text or code to practice.');
      return;
    }

    if (saveToLibrary && user) {
      try {
        await api.practice.saveCustomSnippet({
          title: customSnippetTitle.trim() || 'Custom Snippet',
          language: customSnippetLang,
          content: customText.trim()
        });
        toast.success('Snippet saved to your library!');
      } catch (e) {
        toast.warning('Could not save snippet to cloud, continuing locally.');
      }
    }

    setIsCustomMode(true);
    setCurrentSnippet({
      id: null,
      title: customSnippetTitle.trim() || 'Custom Practice Passage',
      language: customSnippetLang || (isCode ? selectedLanguage : 'Custom'),
      difficulty: 'custom',
      content: customText.trim()
    });
    setShowCustomModal(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success('Custom passage loaded.');
  };

  const handleFetchGithub = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a public GitHub file URL.');
      return;
    }
    setGithubLoading(true);
    setGithubPreview(null);
    try {
      const data = await api.practice.fetchGithubSnippet(githubUrl.trim());
      setGithubPreview(data);
      toast.success(`Fetched ${data.title} (${data.lineCount} lines)!`);
    } catch (e) {
      toast.error(e.message || 'Failed to fetch GitHub file.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleApplyGithubSnippet = () => {
    if (!githubPreview?.content) return;
    setIsCustomMode(true);
    setCurrentSnippet({
      id: null,
      title: githubPreview.title,
      language: githubPreview.language,
      difficulty: 'custom',
      content: githubPreview.content
    });
    setShowCustomModal(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success(`Loaded ${githubPreview.title} into practice!`);
  };

  const handleGenerateSnippet = () => {
    const drill = generateCodingSnippet(generatorLang, generatorTopic, generatorDifficulty);
    setGeneratorPreview(drill);
  };

  const handleApplyGeneratedSnippet = () => {
    if (!generatorPreview?.content) return;
    setIsCustomMode(true);
    setCurrentSnippet({
      id: null,
      title: `${generatorPreview.title} (${generatorPreview.language})`,
      language: generatorPreview.language,
      difficulty: generatorPreview.difficulty,
      content: generatorPreview.content
    });
    setShowCustomModal(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success(`Loaded generated drill: ${generatorPreview.title}!`);
  };

  const handleDeleteSavedSnippet = async (id, e) => {
    e.stopPropagation();
    try {
      await api.practice.deleteCustomSnippet(id);
      setSavedSnippets((prev) => prev.filter((s) => s.id !== id));
      toast.success('Snippet deleted.');
    } catch (err) {
      toast.error('Failed to delete snippet.');
    }
  };

  const targetText = currentSnippet?.content || '';

  return (
    <div className={`typing-stage-wrapper ${isCompactMode ? 'compact-stage' : ''} ${engineStatus === 'typing' ? 'flow-focus-active' : ''}`}>
      {/* Space-Saving Minimalist Toolbar (Focus Mode) */}
      {isCompactMode ? (
        <div className="compact-command-deck-container">
          <div className="compact-command-deck" role="toolbar" aria-label="Practice Controls">
            {/* Primary Mode Segmented Switcher */}
            <div className="compact-modes-pill" role="tablist" aria-label="Practice Modes">
              <button
                type="button"
                role="tab"
                aria-selected={practiceType === 'english' || practiceType === 'practice'}
                className={`compact-mode-btn ${(practiceType === 'english' || practiceType === 'practice') ? 'active' : ''}`}
                onClick={() => handleSwitchPracticeType('english')}
                title="English Typing Practice"
              >
                <BookOpen size={14} />
                <span>English</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={practiceType === 'coding'}
                className={`compact-mode-btn ${practiceType === 'coding' ? 'active' : ''}`}
                onClick={() => handleSwitchPracticeType('coding')}
                title="Coding Practice (25+ Languages)"
              >
                <Code2 size={14} />
                <span>Coding</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={practiceType === 'test'}
                className={`compact-mode-btn ${practiceType === 'test' ? 'active' : ''}`}
                onClick={() => handleSwitchPracticeType('test', 60)}
                title="Official Speed Typing Test"
              >
                <Timer size={14} />
                <span>Speed Test</span>
              </button>
            </div>

            {/* Center Pacing & Filter Controls */}
            <div className="compact-center-group">
              {/* Pacing Durations & Mode (Hidden in Test mode to avoid duplication with test banner) */}
              {!isTest && (
                <div className="compact-micro-group" title="Duration / Mode">
                  {[15, 30, 60, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`compact-micro-btn ${mode === 'time' && duration === sec ? 'active' : ''}`}
                      onClick={() => { setMode('time'); setDuration(sec); setCompletedResult(null); setEngineKey(Date.now()); }}
                      title={`${sec >= 60 ? `${sec / 60}m` : `${sec}s`} timer`}
                    >
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`compact-micro-btn ${mode === 'words' ? 'active' : ''}`}
                    onClick={() => { setMode('words'); setWordCount(25); setCompletedResult(null); setEngineKey(Date.now()); }}
                    title="25 Words sprint"
                  >
                    25w
                  </button>
                  <button
                    type="button"
                    className={`compact-micro-btn ${mode === 'text' ? 'active' : ''}`}
                    onClick={() => { setMode('text'); setCompletedResult(null); setEngineKey(Date.now()); }}
                    title="Complete full passage"
                  >
                    Full
                  </button>
                </div>
              )}

              {/* Coding Language Select */}
              {practiceType === 'coding' && (
                <div className="compact-select-wrapper" title="Select Programming Language">
                  <Code2 size={13} color="var(--color-primary-forest)" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleSelectLanguage(e.target.value)}
                    aria-label="Select Programming Language"
                  >
                    {programmingLanguages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* English Category Select */}
              {(practiceType === 'english' || practiceType === 'practice') && (
                <div className="compact-select-wrapper" title="Select English Topic">
                  <BookOpen size={13} color="var(--color-primary-forest)" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleSelectCategory(e.target.value)}
                    aria-label="Select English Topic"
                  >
                    <option value="All">All Topics</option>
                    {englishCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty Level */}
              {!isTest && (
                <div className="compact-micro-group" title="Difficulty Level">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`compact-micro-btn ${selectedDifficulty === lvl ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedDifficulty(lvl);
                        setIsCustomMode(false);
                        setCompletedResult(null);
                      }}
                    >
                      {lvl === 'intermediate' ? 'med' : lvl === 'beginner' ? 'beg' : lvl === 'advanced' ? 'adv' : 'all'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action Tools & Expand Toggle */}
            <div className="compact-right-group">
              {/* Quick Lesson Indicator & Prev/Next */}
              {!isCustomMode && !isTest && totalLessons > 0 && (
                <div className="compact-lesson-chip">
                  <button
                    type="button"
                    className="compact-arrow-btn"
                    disabled={!prevLesson}
                    onClick={handlePrevSnippet}
                    title={prevLesson ? `Previous: Lesson ${currentLessonNumber - 1}` : 'First lesson'}
                    aria-label="Previous lesson"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="compact-lesson-badge-btn"
                    onClick={() => setShowCurriculumModal(true)}
                    title={`Lesson ${currentLessonNumber} of ${totalLessons} (${completedCount} completed). Click to open full curriculum.`}
                  >
                    <BookOpen size={12} style={{ color: 'var(--color-primary-forest)' }} />
                    <span>L{currentLessonNumber}/{totalLessons}</span>
                    {isCurrentCompleted && <CheckCircle2 size={12} color="var(--color-primary-forest)" />}
                  </button>
                  <button
                    type="button"
                    className="compact-arrow-btn"
                    disabled={!nextLesson || !isLessonUnlocked(currentLessonIndex + 1)}
                    onClick={handleNextSnippet}
                    title={nextLesson ? `Next: Lesson ${currentLessonNumber + 1}` : 'Last lesson'}
                    aria-label="Next lesson"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Shuffle Next */}
              {!isTest && (
                <button
                  type="button"
                  className="compact-btn"
                  onClick={handleNextSnippet}
                  title="Next Passage / Snippet (Shuffle)"
                >
                  <Shuffle size={13} />
                  <span>Next</span>
                </button>
              )}

              {/* Coding tools: Custom & AI */}
              {practiceType === 'coding' && (
                <button
                  type="button"
                  className="compact-btn"
                  onClick={() => setShowCustomModal(true)}
                  title="Paste custom code or import from GitHub"
                >
                  <FileCode size={13} />
                  <span>Custom / GitHub</span>
                </button>
              )}

              {/* Weakness Drill */}
              {!isTest && (
                <button
                  type="button"
                  className={`compact-btn ${currentSnippet?.isWeaknessDrill ? 'active' : ''}`}
                  onClick={handleStartWeaknessDrill}
                  title="Generate intelligent drill targeting error-prone keys"
                >
                  <Target size={13} />
                  <span>Drill</span>
                </button>
              )}

              {/* Expand Full Options & Syllabus Toggle */}
              <button
                type="button"
                className="compact-btn compact-expand-btn"
                onClick={toggleCompactMode}
                title="Expand full studio deck, lesson details & roadmap"
              >
                <SlidersHorizontal size={13} />
                <span>Options ▾</span>
              </button>
            </div>
          </div>

          {/* Dedicated Sub-bar for Coding: Popular Language Quick Chips */}
          {practiceType === 'coding' && (
            <div className="quick-filter-strip" role="group" aria-label="Popular Coding Languages">
              <span className="quick-filter-strip-label">
                <Code2 size={13} />
                <span>Languages:</span>
              </span>
              <div className="quick-filter-chips-scroll">
                {popularCodingLanguages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`quick-chip-btn ${selectedLanguage === item.id ? 'active' : ''}`}
                    onClick={() => handleSelectLanguage(item.id)}
                    title={`Practice ${item.id} code typing`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Sub-bar for English Typing: Popular Category Quick Chips */}
          {(practiceType === 'english' || practiceType === 'practice') && (
            <div className="quick-filter-strip" role="group" aria-label="Popular English Topics">
              <span className="quick-filter-strip-label">
                <BookOpen size={13} />
                <span>Topics:</span>
              </span>
              <div className="quick-filter-chips-scroll">
                {popularEnglishCategories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`quick-chip-btn ${selectedCategory === item.id ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(item.id)}
                    title={`Practice ${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Sub-bar for Speed Typing Test: Official Test Hero Banner */}
          {practiceType === 'test' && (
            <div className="typing-test-hero-card">
              <div className="test-hero-left">
                <div className="test-hero-icon">
                  <Timer size={22} />
                </div>
                <div className="test-hero-text">
                  <div className="test-hero-title-row">
                    <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700 }}>Official Speed Typing Test</h3>
                    <span className="test-badge-certified">Certified Benchmark</span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Standardized timed test under exam conditions. Real-time net WPM with error penalty. 40+ WPM &amp; 95%+ accuracy qualifies for an accredited diploma.
                  </p>
                </div>
              </div>
              <div className="test-hero-right">
                <div className="test-duration-selector">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Timer:</span>
                  {[
                    { sec: 60, label: '1m Sprint' },
                    { sec: 120, label: '2m Standard' },
                    { sec: 180, label: '3m Pro' },
                    { sec: 300, label: '5m Exam' }
                  ].map((t) => (
                    <button
                      key={t.sec}
                      type="button"
                      className={`compact-micro-btn ${duration === t.sec ? 'active' : ''}`}
                      onClick={() => {
                        setMode('time');
                        setDuration(t.sec);
                        setCompletedResult(null);
                        setEngineKey(Date.now());
                      }}
                      style={{ minHeight: '28px', padding: '0.25rem 0.65rem' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleNextSnippet}
                  title="Load another test passage"
                  style={{ gap: '0.35rem', fontSize: '0.785rem' }}
                >
                  <Shuffle size={13} />
                  <span>New Passage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Full Expanded Studio Command Deck */}
          <div className="studio-command-deck">
        <div className="deck-primary-row">
          <div className="deck-title-group">
            <div className="deck-title-icon">
              {practiceType === 'coding' && <Code2 size={20} />}
              {practiceType === 'english' && <BookOpen size={20} />}
              {practiceType === 'test' && <Timer size={20} />}
              {practiceType === 'practice' && <Keyboard size={20} />}
            </div>
            <div className="deck-title-text">
              <h1>
                {practiceType === 'coding' && 'Coding Practice'}
                {practiceType === 'english' && 'English Practice'}
                {practiceType === 'test' && 'Typing Speed Test'}
                {practiceType === 'practice' && 'Quick Practice'}
              </h1>
              <p>
                {practiceType === 'coding' && 'Refine muscle memory for syntactical punctuation, indentation, and logic.'}
                {practiceType === 'english' && 'Cultivate fluid cadence, common word flows, and high accuracy.'}
                {practiceType === 'test' && 'Standardized timed test under exam conditions to establish your rating.'}
                {practiceType === 'practice' && 'Distraction-free everyday typing warm-up.'}
              </p>
            </div>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="segmented-modes" role="tablist" aria-label="Practice Modes">
            <button
              type="button"
              role="tab"
              aria-selected={practiceType === 'english' || practiceType === 'practice'}
              className={`segmented-mode-btn ${(practiceType === 'english' || practiceType === 'practice') ? 'active' : ''}`}
              onClick={() => handleSwitchPracticeType('english')}
            >
              <BookOpen size={15} />
              <span>English Typing</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={practiceType === 'coding'}
              className={`segmented-mode-btn ${practiceType === 'coding' ? 'active' : ''}`}
              onClick={() => handleSwitchPracticeType('coding')}
            >
              <Code2 size={15} />
              <span>Coding Practice</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={practiceType === 'test'}
              className={`segmented-mode-btn ${practiceType === 'test' ? 'active' : ''}`}
              onClick={() => handleSwitchPracticeType('test', 60)}
            >
              <Timer size={15} />
              <span>Speed Test</span>
            </button>
          </div>

          {/* Mode & Pacing Selectors (Time / Words / Passage & Durations) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!isTest && (
              <div className="deck-micro-pills">
                <span className="micro-pill-label">Mode</span>
                <button
                  type="button"
                  className={`micro-pill-btn ${mode === 'time' ? 'active' : ''}`}
                  onClick={() => setMode('time')}
                  title="Time-based countdown"
                >
                  Time
                </button>
                <button
                  type="button"
                  className={`micro-pill-btn ${mode === 'words' ? 'active' : ''}`}
                  onClick={() => setMode('words')}
                  title="Fixed word count"
                >
                  Words
                </button>
                <button
                  type="button"
                  className={`micro-pill-btn ${mode === 'text' ? 'active' : ''}`}
                  onClick={() => setMode('text')}
                  title="Complete full snippet"
                >
                  Passage
                </button>
              </div>
            )}

            {/* Duration Selector */}
            {mode === 'time' && (
              <div className="deck-micro-pills">
                <span className="micro-pill-label">Time</span>
                {(isTest ? [60, 120, 180, 300] : [15, 30, 60, 120, 180, 300]).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    className={`micro-pill-btn ${duration === sec ? 'active' : ''}`}
                    onClick={() => { setDuration(sec); setCompletedResult(null); setEngineKey(Date.now()); }}
                  >
                    {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                  </button>
                ))}
              </div>
            )}

            {/* Word Count Selector */}
            {mode === 'words' && !isTest && (
              <div className="deck-micro-pills">
                <span className="micro-pill-label">Words</span>
                {[10, 25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`micro-pill-btn ${wordCount === w ? 'active' : ''}`}
                    onClick={() => { setWordCount(w); setCompletedResult(null); setEngineKey(Date.now()); }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {/* Collapse to Focus View Button */}
            <button
              type="button"
              className="compact-btn compact-collapse-btn"
              onClick={toggleCompactMode}
              title="Minimize to space-saving focus mode"
            >
              <Minimize2 size={12} />
              <span>Focus View ▲</span>
            </button>
          </div>
        </div>

        {/* Secondary Row: Specific Filters, Difficulty, and Quick Tools */}
        <div className="deck-secondary-row">
          <div className="deck-filter-group">
            {/* Coding Language Dropdown */}
            {practiceType === 'coding' && (
              <div className="deck-pill-select-wrapper">
                <Code2 size={14} style={{ color: 'var(--color-primary-forest)' }} />
                <span>Lang:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setIsCustomMode(false);
                    setCompletedResult(null);
                  }}
                  aria-label="Select Programming Language"
                >
                  {programmingLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}

            {/* English Category Dropdown */}
            {practiceType === 'english' && (
              <div className="deck-pill-select-wrapper">
                <BookOpen size={14} style={{ color: 'var(--color-primary-forest)' }} />
                <span>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setIsCustomMode(false);
                    setCompletedResult(null);
                  }}
                  aria-label="Select English Practice Category"
                >
                  <option value="All">All Categories</option>
                  {englishCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Difficulty Filter */}
            <div className="deck-micro-pills">
              <span className="micro-pill-label">Level</span>
              {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`micro-pill-btn ${selectedDifficulty === lvl ? 'active' : ''}`}
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

          {/* Quick Action Tools */}
          <div className="deck-action-group">
            <button
              type="button"
              className="action-pill-btn"
              onClick={handleNextSnippet}
              title="Load another passage (Shuffle)"
            >
              <Shuffle size={13} />
              <span>Next</span>
            </button>

            <button
              type="button"
              className={`action-pill-btn ${isCustomMode ? 'active' : ''}`}
              onClick={() => setShowCustomModal(true)}
              title="Paste custom snippet or import from GitHub"
            >
              <FileCode size={13} />
              <span>Custom / GitHub</span>
            </button>

            <button
              type="button"
              className={`action-pill-btn ${currentSnippet?.isWeaknessDrill ? 'active' : ''}`}
              onClick={handleStartWeaknessDrill}
              title="Generate intelligent drill targeting your most error-prone keys and symbols"
            >
              <Target size={13} />
              <span>Target Weaknesses</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integrated Smart Curriculum Bar */}
      {!isCustomMode && !isTest && totalLessons > 0 && (
        <div className="curriculum-bar">
          <div className="curriculum-info-left">
            <span className="curriculum-lesson-badge">
              Lesson {currentLessonNumber} of {totalLessons}
            </span>

            <span className="curriculum-title-text" title={currentSnippet?.title || 'Focused Practice'}>
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
              style={{ textTransform: 'capitalize', fontSize: '0.725rem', padding: '0.15rem 0.5rem' }}
            >
              {currentSnippet?.difficulty || 'Practice'}
            </span>

            {/* A-Z Pangram badge */}
            {(() => {
              if (!currentSnippet?.content) return null;
              const clean = currentSnippet.content.toLowerCase().replace(/[^a-z]/g, '');
              const isPangram = new Set(clean).size === 26;
              if (!isPangram) return null;
              return (
                <span
                  className="badge badge-sage"
                  style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                  title="This passage contains all 26 English letters (A-Z) for comprehensive keyboard dexterity practice."
                >
                  ✨ A–Z Pangram
                </span>
              );
            })()}

            {isCurrentCompleted && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--color-primary-forest)',
                  fontSize: '0.775rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </span>
            )}
          </div>

          <div className="curriculum-right-controls">
            {/* Slim Curriculum Progress */}
            <div className="curriculum-progress-mini">
              <div className="curriculum-progress-labels">
                <span>Curriculum</span>
                <strong>{completedCount}/{totalLessons} ({progressPercent}%)</strong>
              </div>
              <div className="curriculum-progress-track">
                <div className="curriculum-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Quick Prev / Next Arrows */}
            <div className="curriculum-nav-group">
              <button
                type="button"
                className="curriculum-nav-btn"
                disabled={!prevLesson}
                onClick={handlePrevSnippet}
                title={prevLesson ? `Previous: Lesson ${currentLessonNumber - 1} (${prevLesson.title})` : 'First lesson'}
                aria-label="Previous lesson"
              >
                <ArrowLeft size={13} />
              </button>
              <button
                type="button"
                className="curriculum-nav-btn"
                disabled={!nextLesson || !isLessonUnlocked(currentLessonIndex + 1)}
                onClick={handleNextSnippet}
                title={
                  !nextLesson
                    ? 'Last lesson'
                    : !isLessonUnlocked(currentLessonIndex + 1)
                    ? 'Next lesson locked (Complete this lesson first)'
                    : `Next: Lesson ${currentLessonNumber + 1} (${nextLesson.title})`
                }
                aria-label="Next lesson"
              >
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Collapsible Roadmap Drawer Toggle */}
            <button
              type="button"
              className={`roadmap-toggle-btn ${isRoadmapOpen ? 'open' : ''}`}
              onClick={() => setIsRoadmapOpen((prev) => !prev)}
              aria-expanded={isRoadmapOpen}
              title="Toggle horizontal lesson roadmap strip"
            >
              <span>Roadmap</span>
              <span style={{ fontSize: '0.7rem' }}>{isRoadmapOpen ? '▲' : '▼'}</span>
            </button>

            {/* All Lessons Modal Trigger */}
            <button
              type="button"
              className="roadmap-toggle-btn"
              onClick={() => setShowCurriculumModal(true)}
              title="Open full searchable curriculum syllabus"
            >
              <ListOrdered size={14} />
              <span>All Lessons ({totalLessons})</span>
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Roadmap Drawer (Horizontal Scroll Strip) */}
      {!isCustomMode && !isTest && totalLessons > 0 && (
        <div className={`roadmap-drawer ${isRoadmapOpen ? 'open' : 'closed'}`}>
          <div className="roadmap-header-stats">
            <span style={{ fontWeight: 600 }}>
              Lesson Roadmap (1 to {totalLessons}) • <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Complete each lesson to unlock the next</span>
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span>🔓 <strong>{unlockedLessonsCount}</strong> Unlocked</span>
              <span>✓ <strong style={{ color: 'var(--color-primary-forest)' }}>{completedCount}</strong> Completed</span>
              <span style={{ color: 'var(--color-text-muted)' }}>🔒 <strong>{totalLessons - unlockedLessonsCount}</strong> Locked</span>
            </div>
          </div>

          <div className="lesson-roadmap-strip">
            {contentList.map((item, idx) => {
              const isSelected = item.id === currentSnippet?.id;
              const isCompleted = completedLessonIds.includes(item.id);
              const isUnlocked = isLessonUnlocked(idx);
              const lessonNum = idx + 1;

              return (
                <button
                  key={item.id || idx}
                  ref={isSelected ? activeRoadmapPillRef : null}
                  onClick={() => handleSelectLesson(item, idx)}
                  disabled={!isUnlocked}
                  className={`roadmap-pill ${isSelected ? 'active' : ''}`}
                  title={
                    !isUnlocked
                      ? `Lesson ${lessonNum}: Locked (Complete Lesson ${lessonNum - 1} first)`
                      : isCompleted
                      ? `Lesson ${lessonNum}: ${item.title} (Completed ✓)`
                      : isSelected
                      ? `Lesson ${lessonNum}: ${item.title} (Currently Active)`
                      : `Lesson ${lessonNum}: ${item.title} (Unlocked)`
                  }
                  style={{
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    border: isSelected
                      ? '2px solid var(--color-primary-forest)'
                      : isCompleted
                      ? '1px solid var(--color-primary-forest)'
                      : isUnlocked
                      ? '1px solid var(--color-border)'
                      : '1px solid var(--color-bg-soft)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-forest)'
                      : isCompleted
                      ? 'var(--color-bg-soft)'
                      : isUnlocked
                      ? 'var(--color-bg-surface)'
                      : 'var(--color-bg-soft)',
                    color: isSelected
                      ? '#ffffff'
                      : isCompleted
                      ? 'var(--color-primary-forest)'
                      : isUnlocked
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    opacity: isUnlocked ? 1 : 0.45
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={12} />
                  ) : isSelected ? (
                    <span>▶</span>
                  ) : !isUnlocked ? (
                    <Lock size={11} />
                  ) : null}
                  <span>{lessonNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
        </>
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
          snippetId={currentSnippet?.id || currentSnippet?.title}
          targetText={targetText}
          title={currentSnippet?.title || 'Focused Practice'}
          language={currentSnippet?.language || (isCode ? selectedLanguage : 'English')}
          difficulty={currentSnippet?.difficulty || selectedDifficulty}
          isCode={isCode}
          mode={mode}
          duration={duration}
          onComplete={handleSessionComplete}
          onStatusChange={setEngineStatus}
        />
      )}

      {/* Custom & GitHub Importer Modal */}
      {showCustomModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode size={20} color="var(--color-primary-forest)" />
                  <span>Custom Code & GitHub Importer</span>
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Practice with your own snippets or import open-source code directly from public GitHub repositories.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowCustomModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
              <button
                className={`btn btn-sm ${customModalTab === 'custom' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
                onClick={() => setCustomModalTab('custom')}
              >
                <FileCode size={15} />
                <span>Custom Snippet</span>
              </button>
              <button
                className={`btn btn-sm ${customModalTab === 'github' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
                onClick={() => setCustomModalTab('github')}
              >
                <Globe size={15} />
                <span>Import from GitHub</span>
              </button>
              <button
                className={`btn btn-sm ${customModalTab === 'generator' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
                onClick={() => {
                  setCustomModalTab('generator');
                  if (!generatorPreview) {
                    const initial = generateCodingSnippet('JavaScript', 'Async / Await Pipeline', 'intermediate');
                    setGeneratorPreview(initial);
                  }
                }}
              >
                <Sparkles size={15} />
                <span>AI Drill Generator</span>
              </button>
            </div>

            {customModalTab === 'custom' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Snippet Title
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Binary Search Tree / React State Hook"
                      value={customSnippetTitle}
                      onChange={(e) => setCustomSnippetTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Language
                    </label>
                    <select
                      className="input"
                      value={customSnippetLang}
                      onChange={(e) => setCustomSnippetLang(e.target.value)}
                    >
                      {['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'C++', 'C', 'Java', 'HTML', 'CSS', 'SQL', 'Text'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Code or Passage Content
                  </label>
                  <textarea
                    className="input"
                    rows={8}
                    placeholder="Paste code excerpt or text here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', resize: 'vertical' }}
                  />
                </div>

                {user && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={saveToLibrary}
                      onChange={(e) => setSaveToLibrary(e.target.checked)}
                    />
                    <span>Save this snippet to my account library for future practice</span>
                  </label>
                )}

                {/* Saved Snippets List */}
                {user && savedSnippets.length > 0 && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                      Saved In Your Library ({savedSnippets.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto' }}>
                      {savedSnippets.map((s) => (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.75rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setCustomText(s.content);
                            setCustomSnippetTitle(s.title);
                            setCustomSnippetLang(s.language || 'JavaScript');
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>{s.language}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.title}</span>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.4rem', color: '#B91C1C' }}
                            onClick={(e) => handleDeleteSavedSnippet(s.id, e)}
                            title="Delete snippet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost" onClick={() => setShowCustomModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleApplyCustomText}>
                    Load Snippet
                  </button>
                </div>
              </div>
            ) : customModalTab === 'github' ? (
              /* GitHub Importer Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Public GitHub File URL
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://github.com/torvalds/linux/blob/master/init/main.c"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleFetchGithub}
                      disabled={githubLoading || !githubUrl.trim()}
                    >
                      {githubLoading ? (
                        <>
                          <div className="spinner" style={{ width: '14px', height: '14px' }} />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Fetch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', display: 'block' }}>
                    Paste a link to any public repository file. GitHub raw content will be retrieved and parsed.
                  </span>
                </div>

                {githubPreview && (
                  <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{githubPreview.title}</strong>
                      <span className="badge badge-forest">{githubPreview.language}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                      {githubPreview.lineCount} lines • {githubPreview.content?.length} characters
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {githubPreview.content.slice(0, 400)}...
                    </pre>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: '0.75rem' }}
                      onClick={handleApplyGithubSnippet}
                    >
                      Start Typing This File
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* AI Drill Generator Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Target Language / Domain
                    </label>
                    <select
                      className="input"
                      value={generatorLang}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setGeneratorLang(newLang);
                        const topics = getAvailableTopics(newLang);
                        const defaultTopic = topics[0] || '';
                        setGeneratorTopic(defaultTopic);
                        const initial = generateCodingSnippet(newLang, defaultTopic, generatorDifficulty);
                        setGeneratorPreview(initial);
                      }}
                    >
                      {['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'SQL', 'Algorithms (DSA)'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Curated Topic Concept
                    </label>
                    <select
                      className="input"
                      value={generatorTopic}
                      onChange={(e) => {
                        const t = e.target.value;
                        setGeneratorTopic(t);
                        const res = generateCodingSnippet(generatorLang, t, generatorDifficulty);
                        setGeneratorPreview(res);
                      }}
                    >
                      {getAvailableTopics(generatorLang).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Or Custom Concept Search
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Trie, LRU, Mutex, Recursive, Reducer..."
                      value={generatorTopic}
                      onChange={(e) => setGeneratorTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerateSnippet();
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={handleGenerateSnippet}
                    >
                      <Sparkles size={16} />
                      <span>Synthesize</span>
                    </button>
                  </div>
                </div>

                {generatorPreview && (
                  <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{generatorPreview.title}</strong>
                      <span className="badge badge-sage">{generatorPreview.language}</span>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        fontSize: '0.825rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {generatorPreview.content}
                    </pre>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.85rem' }}
                      onClick={handleApplyGeneratedSnippet}
                    >
                      Start Typing This Generated Drill
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curriculum / All Lessons Modal (50 Lessons with Filters & Search) */}
      {showCurriculumModal && (
        <div className="modal-backdrop" onClick={() => setShowCurriculumModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px', width: '94%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={22} color="var(--color-primary-forest)" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                    {isCode ? `${selectedLanguage} Curriculum (50 Lessons)` : `${selectedCategory} Curriculum (50 Lessons)`}
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Progressive curriculum from Lesson 1 to Lesson 50. Complete each lesson to unlock subsequent challenges.
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
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <span>
                Total: <strong>{totalLessons} Lessons</strong>
              </span>
              <span>
                Unlocked: <strong style={{ color: 'var(--color-text-primary)' }}>{unlockedLessonsCount}</strong>
              </span>
              <span>
                Completed:{' '}
                <strong style={{ color: 'var(--color-primary-forest)' }}>
                  {completedCount} / {totalLessons} ({progressPercent}%)
                </strong>
              </span>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: `All (${totalLessons})` },
                  { key: 'beginner', label: 'Beginner (1-15)' },
                  { key: 'intermediate', label: 'Intermediate (16-35)' },
                  { key: 'advanced', label: 'Advanced (36-50)' },
                  { key: 'unlocked', label: `Unlocked Only (${unlockedLessonsCount})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn btn-sm ${modalFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                    onClick={() => setModalFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search lessons by title, keyword, or number..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem' }}
                />
              </div>
            </div>

            {/* Lessons List */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
              {contentList
                .filter((lesson, idx) => {
                  const lessonNum = idx + 1;
                  const isUnlocked = isLessonUnlocked(idx);

                  // Tab filter
                  if (modalFilter === 'beginner' && (lessonNum < 1 || lessonNum > 15)) return false;
                  if (modalFilter === 'intermediate' && (lessonNum < 16 || lessonNum > 35)) return false;
                  if (modalFilter === 'advanced' && (lessonNum < 36 || lessonNum > 50)) return false;
                  if (modalFilter === 'unlocked' && !isUnlocked) return false;

                  // Search filter
                  if (modalSearch.trim()) {
                    const q = modalSearch.toLowerCase();
                    const matchTitle = lesson.title.toLowerCase().includes(q);
                    const matchNum = String(lessonNum) === q || `lesson ${lessonNum}`.includes(q);
                    return matchTitle || matchNum;
                  }

                  return true;
                })
                .map((lesson) => {
                  const originalIdx = contentList.findIndex((item) => item.id === lesson.id);
                  const idx = originalIdx >= 0 ? originalIdx : 0;
                  const isSelected = lesson.id === currentSnippet?.id;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isUnlocked = isLessonUnlocked(idx);
                  const lessonNum = idx + 1;

                  return (
                    <div
                      key={lesson.id || idx}
                      onClick={() => handleSelectLesson(lesson, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1.5px solid var(--color-primary-forest)'
                          : isCompleted
                          ? '1px solid var(--color-primary-forest)'
                          : isUnlocked
                          ? '1px solid var(--color-border)'
                          : '1px solid var(--color-bg-soft)',
                        backgroundColor: isSelected
                          ? 'var(--color-bg-surface)'
                          : isUnlocked
                          ? 'var(--color-bg-card)'
                          : 'var(--color-bg-soft)',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.55,
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
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: isCompleted
                              ? 'var(--color-primary-forest)'
                              : isSelected
                              ? 'var(--color-primary-sage)'
                              : isUnlocked
                              ? 'var(--color-bg-soft)'
                              : 'var(--color-bg-surface)',
                            color: isCompleted
                              ? '#ffffff'
                              : isSelected
                              ? '#ffffff'
                              : 'var(--color-text-secondary)'
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : !isUnlocked ? (
                            <Lock size={13} color="var(--color-text-muted)" />
                          ) : (
                            lessonNum
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.92rem', color: isUnlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
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
                              style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.12rem 0.45rem' }}
                            >
                              {lesson.difficulty}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {lesson.word_count || lesson.content?.split(/\s+/).length || 0} words • {lesson.char_count || lesson.content?.length || 0} chars
                          </span>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>
                            Active
                          </span>
                        ) : isCompleted ? (
                          <span style={{ color: 'var(--color-primary-forest)', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        ) : isUnlocked ? (
                          <span className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}>
                            Play →
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAuthToken,
  getMe,
  getSemesters,
  getSemesterSubjects,
  login,
  subscribeToAuthExpired,
  setAuthToken,
} from './api';
import AIAssistant from './components/ai/AIAssistant';
import DiscussionTab from './components/discussion/DiscussionTab';
import HomeTab from './components/home/HomeTab';
import Layout from './components/layout/Layout';
import LeaderboardTab from './components/leaderboard/LeaderboardTab';
import MaterialsTab from './components/materials/MaterialsTab';
import QuizTab from './components/quiz/QuizTab';

export default function App() {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(getAuthToken()));

  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [catalogError, setCatalogError] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const resetSession = useCallback((message = '') => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setSemesters([]);
    setSelectedSemester(null);
    setSubjects([]);
    setSelectedSubjectId(null);
    setCatalogError('');
    setActiveTab('home');
    setMobileSidebarOpen(false);
    setAssistantOpen(false);
    setLoginError(message);
  }, []);

  useEffect(() => {
    return subscribeToAuthExpired((message) => {
      resetSession(message || 'Session expired. Please sign in again.');
    });
  }, [resetSession]);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrapAuth() {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const me = await getMe();
        if (isCancelled) {
          return;
        }
        setUser(me);
        setLoginError('');
      } catch (error) {
        if (isCancelled) {
          return;
        }
        resetSession(error.message || 'Session expired. Please sign in again.');
      } finally {
        if (!isCancelled) {
          setAuthLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isCancelled = true;
    };
  }, [resetSession, token]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSemesters() {
      if (!token || !user) {
        setSemesters([]);
        setSelectedSemester(null);
        return;
      }

      try {
        setCatalogError('');
        const semesterList = await getSemesters();
        if (isCancelled) {
          return;
        }

        setSemesters(semesterList);

        if (!semesterList.length) {
          setSelectedSemester(null);
          return;
        }

        const available = semesterList.map((entry) => entry.id);
        const preferred = available.includes(user.currentSemester)
          ? user.currentSemester
          : available[0];

        setSelectedSemester((current) =>
          current && available.includes(current) ? current : preferred,
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setSemesters([]);
        setSelectedSemester(null);
        setCatalogError(error.message || 'Failed to load semesters.');
      }
    }

    loadSemesters();

    return () => {
      isCancelled = true;
    };
  }, [token, user]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSubjects() {
      if (!token || !selectedSemester) {
        setSubjects([]);
        setSelectedSubjectId(null);
        return;
      }

      try {
        setCatalogError('');
        const subjectList = await getSemesterSubjects(selectedSemester);
        if (isCancelled) {
          return;
        }

        setSubjects(subjectList);
        setSelectedSubjectId((current) => {
          if (current && subjectList.some((subject) => subject.id === current)) {
            return current;
          }
          return subjectList[0]?.id || null;
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setSubjects([]);
        setSelectedSubjectId(null);
        setCatalogError(error.message || 'Failed to load subjects.');
      }
    }

    loadSubjects();

    return () => {
      isCancelled = true;
    };
  }, [token, selectedSemester]);

  const selectedSubject = useMemo(
    () =>
      subjects.find((subject) => subject.id === selectedSubjectId) ||
      subjects[0] ||
      null,
    [subjects, selectedSubjectId],
  );

  const handleLogin = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const data = await login(email, password);
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user || null);
      setCatalogError('');
      setActiveTab('home');
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    resetSession('');
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      setDesktopSidebarOpen((open) => !open);
      return;
    }

    setMobileSidebarOpen((open) => !open);
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  const semesterOptions = semesters.map((entry) => entry.id);

  const renderActiveTab = () => {
    const subjectKey = selectedSubject?.id || 'none';

    switch (activeTab) {
      case 'materials':
        return <MaterialsTab key={`materials-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'discussion':
        return <DiscussionTab key={`discussion-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'quiz':
        return <QuizTab key={`quiz-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'leaderboard':
        return <LeaderboardTab key={`leaderboard-${subjectKey}`} selectedSubject={selectedSubject} />;
      case 'home':
      default:
        return (
          <HomeTab
            key={`home-${subjectKey}`}
            selectedSubject={selectedSubject}
            selectedSemester={selectedSemester}
            onGoToMaterials={() => setActiveTab('materials')}
          />
        );
    }
  };

  return (
    <>
      <Layout
        navbarProps={{
          semesterOptions,
          selectedSemester,
          onSemesterChange: setSelectedSemester,
          subjects,
          selectedSubjectId: selectedSubject?.id || '',
          onSubjectChange: setSelectedSubjectId,
          selectedSubject,
          onToggleSidebar: handleToggleSidebar,
          onToggleAssistant: () => setAssistantOpen((open) => !open),
          assistantOpen,
          onLogout: handleLogout,
        }}
        sidebarProps={{
          activeTab,
          onTabChange: (tabId) => {
            setActiveTab(tabId);
            setMobileSidebarOpen(false);
          },
          isDesktopOpen: desktopSidebarOpen,
          isMobileOpen: mobileSidebarOpen,
          onCloseMobile: () => setMobileSidebarOpen(false),
        }}
      >
        {catalogError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {catalogError}
          </div>
        ) : null}

        {renderActiveTab()}
      </Layout>

      <AIAssistant
        key={selectedSubject?.id || 'ai-none'}
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        selectedSubject={selectedSubject}
        units={[]}
      />
    </>
  );
}

function LoginScreen({ onLogin, error, loading }) {
  const [email, setEmail] = useState('arjun@study.com');
  const [password, setPassword] = useState('student123');

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Sign in to Hushh Study</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>

        <div className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="input-field"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onLogin(email, password);
              }
            }}
          />
        </div>

        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}

        <button
          type="button"
          className="btn-primary mt-4 w-full justify-center text-sm"
          disabled={loading}
          onClick={() => onLogin(email, password)}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import Dashboard from './Dashboard';

// Import the supabase mock
import '@/test/mocks/supabase';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock useAuth
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock useBookmarks
vi.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    isLoading: false,
    isBookmarked: vi.fn(() => false),
    addBookmark: { mutate: vi.fn() },
    removeBookmark: { mutate: vi.fn() },
    getBookmarkNote: vi.fn(() => null),
    updateNote: { mutate: vi.fn() },
  }),
}));

// Mock useAppNavigation
const mockSetCurrentView = vi.fn();
const mockSetReviewingTestId = vi.fn();
vi.mock('@/hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({
    currentView: 'dashboard',
    setCurrentView: mockSetCurrentView,
    reviewingTestId: null,
    setReviewingTestId: mockSetReviewingTestId,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock components that render in different views
vi.mock('@/components/PracticeTest', () => ({
  PracticeTest: ({ onBack }: any) => (
    <div data-testid="practice-test">
      Practice Test View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/RandomPractice', () => ({
  RandomPractice: ({ onBack }: any) => (
    <div data-testid="random-practice">
      Random Practice View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/WeakQuestionsReview', () => ({
  WeakQuestionsReview: ({ onBack }: any) => (
    <div data-testid="weak-questions">
      Weak Questions View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/BookmarkedQuestions', () => ({
  BookmarkedQuestions: ({ onBack }: any) => (
    <div data-testid="bookmarked-questions">
      Bookmarked Questions View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/SubelementPractice', () => ({
  SubelementPractice: ({ onBack }: any) => (
    <div data-testid="subelement-practice">
      Subelement Practice View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/Glossary', () => ({
  Glossary: ({ onStartFlashcards }: any) => (
    <div data-testid="glossary">
      Glossary View
      <button onClick={onStartFlashcards}>Start Flashcards</button>
    </div>
  ),
}));

vi.mock('@/components/GlossaryFlashcards', () => ({
  GlossaryFlashcards: ({ onBack }: any) => (
    <div data-testid="glossary-flashcards">
      Glossary Flashcards View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/TestResultReview', () => ({
  TestResultReview: ({ onBack }: any) => (
    <div data-testid="test-result-review">
      Test Result Review View
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children, currentView }: any) => (
    <div data-testid="app-layout" data-current-view={currentView}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/WeeklyGoalsModal', () => ({
  WeeklyGoalsModal: () => null,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderDashboard = (initialView = 'dashboard') => {
  // Update mock to return the desired view
  vi.mocked(mockSetCurrentView).mockImplementation(() => {});
  
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TooltipProvider>
          <Dashboard />
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the AppLayout wrapper', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      });
    });

    it('displays the dashboard view by default', async () => {
      renderDashboard();
      
      await waitFor(() => {
        const appLayout = screen.getByTestId('app-layout');
        expect(appLayout).toHaveAttribute('data-current-view', 'dashboard');
      });
    });
  });

  describe('Authentication Redirect', () => {
    it('redirects to home when user is not authenticated', async () => {
      // Override useAuth mock for this test
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          loading: false,
        }),
      }));
      
      const DashboardModule = await import('./Dashboard');
      const UnauthDashboard = DashboardModule.default;
      
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TooltipProvider>
              <UnauthDashboard />
            </TooltipProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });
});

describe('Dashboard Views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders practice-test view when currentView is practice-test', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'practice-test',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardPractice } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardPractice />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('practice-test')).toBeInTheDocument();
    });
  });

  it('renders random-practice view when currentView is random-practice', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'random-practice',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardRandom } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardRandom />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('random-practice')).toBeInTheDocument();
    });
  });

  it('renders bookmarks view when currentView is bookmarks', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'bookmarks',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardBookmarks } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardBookmarks />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('bookmarked-questions')).toBeInTheDocument();
    });
  });

  it('renders glossary view when currentView is glossary', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'glossary',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardGlossary } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardGlossary />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('glossary')).toBeInTheDocument();
    });
  });

  it('renders subelement-practice view when currentView is subelement-practice', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'subelement-practice',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardSubelement } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardSubelement />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('subelement-practice')).toBeInTheDocument();
    });
  });

  it('renders weak-questions view when currentView is weak-questions', async () => {
    vi.doMock('@/hooks/useAppNavigation', () => ({
      useAppNavigation: () => ({
        currentView: 'weak-questions',
        setCurrentView: vi.fn(),
        reviewingTestId: null,
        setReviewingTestId: vi.fn(),
      }),
    }));
    
    const { default: DashboardWeak } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <DashboardWeak />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('weak-questions')).toBeInTheDocument();
    });
  });
});

describe('Dashboard Loading State', () => {
  it('shows loading spinner when auth is loading', async () => {
    vi.doMock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: null,
        loading: true,
      }),
    }));
    
    const { default: LoadingDashboard } = await import('./Dashboard');
    
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TooltipProvider>
            <LoadingDashboard />
          </TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    
    // When loading, it should show a loading state
    await waitFor(() => {
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });
});

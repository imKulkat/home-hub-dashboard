import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, LogOut } from 'lucide-react';
import { SystemStats } from '@/components/dashboard/SystemStats';
import { DockerContainers } from '@/components/dashboard/DockerContainers';
import { AppStore } from '@/components/dashboard/AppStore';
import { Terminal } from '@/components/dashboard/Terminal';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 glow-primary">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">HomeServer</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        <section className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <SystemStats />
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <DockerContainers />
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <AppStore />
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Terminal />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          HomeServer Dashboard • All API endpoints configurable in{' '}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">src/config/api.ts</code>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

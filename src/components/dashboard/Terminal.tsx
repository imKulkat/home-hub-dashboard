import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error';
  content: string;
}

export const Terminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: 'output', content: 'Welcome to HomeServer Terminal' },
    { id: 1, type: 'output', content: 'Type "help" for available commands' },
  ]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lineIdRef = useRef(2);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/terminal?token=${token}`);
      
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
      
      ws.onmessage = (event) => {
        setLines(prev => [
          ...prev,
          { id: lineIdRef.current++, type: 'output', content: event.data },
        ]);
      };

      wsRef.current = ws;
      return () => ws.close();
    } catch {
      // WebSocket not available, use demo mode
      setConnected(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newInput = input.trim();
    setLines(prev => [
      ...prev,
      { id: lineIdRef.current++, type: 'input', content: `$ ${newInput}` },
    ]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(newInput);
    } else {
      // Demo mode - simulate responses
      setTimeout(() => {
        let response = 'Command not found';
        
        if (newInput === 'help') {
          response = 'Available commands: help, uptime, df, free, docker ps';
        } else if (newInput === 'uptime') {
          response = '15:32:41 up 42 days, 3:15, 2 users, load average: 0.52, 0.48, 0.42';
        } else if (newInput === 'df') {
          response = 'Filesystem      Size  Used Avail Use%\n/dev/sda1       932G  450G  435G  51%';
        } else if (newInput === 'free') {
          response = '              total        used        free\nMem:           32Gi       12Gi       15Gi';
        } else if (newInput === 'docker ps') {
          response = 'CONTAINER ID   NAME            STATUS\na1b2c3d4e5f6   jellyfin        Up 2 days\nb2c3d4e5f6g7   homeassistant   Up 2 days';
        }

        setLines(prev => [
          ...prev,
          { id: lineIdRef.current++, type: 'output', content: response },
        ]);
      }, 300);
    }

    setInput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Terminal</h2>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              connected ? 'bg-success animate-pulse-glow' : 'bg-muted-foreground'
            )}
          />
          <span className="text-xs text-muted-foreground">
            {connected ? 'Connected' : 'Demo Mode'}
          </span>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-background overflow-hidden">
        <div
          ref={outputRef}
          className="h-64 overflow-y-auto p-4 font-mono text-sm"
        >
          {lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                'whitespace-pre-wrap',
                line.type === 'input' && 'text-primary',
                line.type === 'output' && 'text-foreground',
                line.type === 'error' && 'text-destructive'
              )}
            >
              {line.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border">
          <div className="flex items-center px-4 py-2 gap-2">
            <span className="text-primary font-mono">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-transparent outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Send className="h-4 w-4 text-primary" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Container, Play, Square, RefreshCw } from 'lucide-react';
import { API_CONFIG, authFetch } from '@/config/api';
import { cn } from '@/lib/utils';

interface ContainerData {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpu: number;
  ram: string;
  ports: string[];
}

export const DockerContainers = () => {
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContainers = async () => {
    try {
      const response = await authFetch(API_CONFIG.endpoints.docker.containers);
      if (response.ok) {
        const data = await response.json();
        setContainers(data);
      }
    } catch (error) {
      console.error('Failed to fetch containers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, API_CONFIG.polling.containers);
    return () => clearInterval(interval);
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'running') {
      return <Play className="h-3 w-3 fill-current" />;
    }
    return <Square className="h-3 w-3 fill-current" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Container className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Docker Containers</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsLoading(true);
              fetchContainers();
            }}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4 text-muted-foreground', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">
                  Container
                </th>
                <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">
                  CPU
                </th>
                <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">
                  RAM
                </th>
                <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">
                  Ports
                </th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr
                  key={container.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-foreground">{container.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                        container.status === 'running'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      <StatusIcon status={container.status} />
                      {container.status}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {container.cpu.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-muted-foreground">{container.ram}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {container.ports.map((port) => (
                        <span
                          key={port}
                          className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground"
                        >
                          {port}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Download, Check, Loader2, X, Package } from 'lucide-react';
import { API_CONFIG, authFetch } from '@/config/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const apps: App[] = [
  { id: 'jellyfin', name: 'Jellyfin', description: 'Free media streaming server', icon: '🎬' },
  { id: 'homeassistant', name: 'Home Assistant', description: 'Home automation platform', icon: '🏠' },
  { id: 'nextcloud', name: 'Nextcloud', description: 'Self-hosted cloud storage', icon: '☁️' },
  { id: 'immich', name: 'Immich', description: 'Photo and video backup', icon: '📷' },
  { id: 'vaultwarden', name: 'Vaultwarden', description: 'Password manager server', icon: '🔐' },
  { id: 'qbittorrent', name: 'qBittorrent', description: 'Torrent download client', icon: '📥' },
  { id: 'sonarr', name: 'Sonarr', description: 'TV show management', icon: '📺' },
  { id: 'radarr', name: 'Radarr', description: 'Movie collection manager', icon: '🎥' },
  { id: 'lidarr', name: 'Lidarr', description: 'Music collection manager', icon: '🎵' },
];

type InstallStatus = 'idle' | 'installing' | 'success' | 'error';

export const AppStore = () => {
  const [installStatus, setInstallStatus] = useState<Record<string, InstallStatus>>({});
  const { toast } = useToast();

  const installApp = async (appId: string) => {
    setInstallStatus(prev => ({ ...prev, [appId]: 'installing' }));

    try {
      const response = await authFetch(API_CONFIG.endpoints.install, {
        method: 'POST',
        body: JSON.stringify({ app: appId }),
      });

      if (!response.ok) {
        throw new Error('Install request failed');
      }

      const { id: jobId } = await response.json();

      // Poll for status
      const pollStatus = async () => {
        const statusRes = await authFetch(`${API_CONFIG.endpoints.installStatus}?id=${jobId}`);
        if (statusRes.ok) {
          const status = await statusRes.json();
          if (status.status === 'completed') {
            setInstallStatus(prev => ({ ...prev, [appId]: 'success' }));
            toast({
              title: 'Installation Complete',
              description: `${apps.find(a => a.id === appId)?.name} has been installed.`,
            });
            return;
          } else if (status.status === 'failed') {
            throw new Error('Installation failed');
          }
        }
        setTimeout(pollStatus, 2000);
      };

      pollStatus();
    } catch (error) {
      console.error('Install failed:', error);
      setInstallStatus(prev => ({ ...prev, [appId]: 'error' }));
      toast({
        title: 'Installation Failed',
        description: `Failed to install ${apps.find(a => a.id === appId)?.name}.`,
        variant: 'destructive',
      });
    }
  };

  const getButtonContent = (appId: string) => {
    const status = installStatus[appId] || 'idle';
    
    switch (status) {
      case 'installing':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Installing...
          </>
        );
      case 'success':
        return (
          <>
            <Check className="h-4 w-4" />
            Installed
          </>
        );
      case 'error':
        return (
          <>
            <X className="h-4 w-4" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Download className="h-4 w-4" />
            Install
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">App Store</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const status = installStatus[app.id] || 'idle';
          
          return (
            <div
              key={app.id}
              className="border border-border rounded-lg bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:glow-primary"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{app.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{app.name}</h3>
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => installApp(app.id)}
                disabled={status === 'installing' || status === 'success'}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  status === 'idle' && 'bg-primary text-primary-foreground hover:bg-primary/90 glow-primary',
                  status === 'installing' && 'bg-muted text-muted-foreground cursor-wait',
                  status === 'success' && 'bg-success/20 text-success cursor-default',
                  status === 'error' && 'bg-destructive/20 text-destructive'
                )}
              >
                {getButtonContent(app.id)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

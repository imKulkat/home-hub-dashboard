import { useEffect, useState } from 'react';
import { Cpu, MemoryStick, HardDrive, Thermometer } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { API_CONFIG, authFetch } from '@/config/api';

interface SystemData {
  cpu: number;
  ram: number;
  ramTotal: number;
  ramUsed: number;
}

interface StorageData {
  used: number;
  total: number;
  percent: number;
}

interface TemperatureData {
  cpu: number;
}

// Mock data for demo (replace with real API calls)
const getMockData = () => ({
  system: {
    cpu: Math.floor(Math.random() * 40) + 15,
    ram: Math.floor(Math.random() * 30) + 40,
    ramTotal: 32,
    ramUsed: Math.floor(Math.random() * 10) + 12,
  },
  storage: {
    used: 450,
    total: 1000,
    percent: 45,
  },
  temperature: {
    cpu: Math.floor(Math.random() * 15) + 45,
  },
});

export const SystemStats = () => {
  const [system, setSystem] = useState<SystemData | null>(null);
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [temperature, setTemperature] = useState<TemperatureData | null>(null);
  const [useMock, setUseMock] = useState(false);

  const fetchStats = async () => {
    try {
      const [sysRes, storRes, tempRes] = await Promise.all([
        authFetch(API_CONFIG.endpoints.stats.system),
        authFetch(API_CONFIG.endpoints.stats.storage),
        authFetch(API_CONFIG.endpoints.stats.temperature),
      ]);

      if (sysRes.ok && storRes.ok && tempRes.ok) {
        setSystem(await sysRes.json());
        setStorage(await storRes.json());
        setTemperature(await tempRes.json());
        setUseMock(false);
      } else {
        throw new Error('API not available');
      }
    } catch {
      // Use mock data if API is not available
      setUseMock(true);
      const mock = getMockData();
      setSystem(mock.system);
      setStorage(mock.storage);
      setTemperature(mock.temperature);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, API_CONFIG.polling.stats);
    return () => clearInterval(interval);
  }, []);

  const getVariant = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'danger';
    if (value >= thresholds[0]) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">System Stats</h2>
        {useMock && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Demo Mode
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CPU Usage"
          value={system?.cpu ?? 0}
          unit="%"
          icon={Cpu}
          progress={system?.cpu}
          variant={getVariant(system?.cpu ?? 0, [60, 85])}
        />
        
        <StatCard
          title="RAM Usage"
          value={system?.ramUsed ?? 0}
          unit={`/ ${system?.ramTotal ?? 0} GB`}
          icon={MemoryStick}
          progress={system?.ram}
          variant={getVariant(system?.ram ?? 0, [70, 90])}
        />
        
        <StatCard
          title="Disk Usage"
          value={storage?.used ?? 0}
          unit={`/ ${storage?.total ?? 0} GB`}
          icon={HardDrive}
          progress={storage?.percent}
          variant={getVariant(storage?.percent ?? 0, [75, 90])}
        />
        
        <StatCard
          title="CPU Temp"
          value={temperature?.cpu ?? 0}
          unit="°C"
          icon={Thermometer}
          progress={((temperature?.cpu ?? 0) / 100) * 100}
          variant={getVariant(temperature?.cpu ?? 0, [65, 80])}
        />
      </div>
    </div>
  );
};

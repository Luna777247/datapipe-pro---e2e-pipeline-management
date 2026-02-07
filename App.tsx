
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TaskStatus, PipelineTask } from './types';
import { INITIAL_TASKS, ICONS, DATA_SCHEMA } from './constants';
import { getPipelineInsights } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Sub-components defined outside for performance ---

const SidebarItem: React.FC<{ 
  id: string; 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: (id: string) => void 
}> = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      active 
        ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const TaskNode: React.FC<{ task: PipelineTask }> = ({ task }) => {
  const statusColors = {
    [TaskStatus.IDLE]: 'bg-gray-700/50 border-gray-600',
    [TaskStatus.RUNNING]: 'bg-blue-900/30 border-blue-500 animate-pulse',
    [TaskStatus.SUCCESS]: 'bg-emerald-900/30 border-emerald-500',
    [TaskStatus.FAILED]: 'bg-rose-900/30 border-rose-500',
    [TaskStatus.SKIPPED]: 'bg-amber-900/30 border-amber-500',
  };

  const statusIcons = {
    [TaskStatus.IDLE]: '⚪',
    [TaskStatus.RUNNING]: '🔄',
    [TaskStatus.SUCCESS]: '✅',
    [TaskStatus.FAILED]: '❌',
    [TaskStatus.SKIPPED]: '⏭️',
  };

  return (
    <div className={`flex flex-col p-4 rounded-lg border min-w-[200px] transition-all duration-300 ${statusColors[task.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{task.category}</span>
        <span>{statusIcons[task.status]}</span>
      </div>
      <h4 className="text-sm font-semibold truncate">{task.name}</h4>
      {task.status === TaskStatus.RUNNING && (
        <div className="mt-2 h-1 w-full bg-blue-900 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_1s_infinite_linear]" style={{ width: '40%' }}></div>
        </div>
      )}
    </div>
  );
};

const SchemaCard: React.FC<{ table: typeof DATA_SCHEMA[0] }> = ({ table }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
    <div className="px-4 py-2 bg-gray-800/80 flex items-center justify-between">
      <h5 className="text-sm font-bold mono text-blue-400">{table.name}</h5>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${table.type === 'Fact' ? 'bg-rose-900/40 text-rose-400' : 'bg-blue-900/40 text-blue-400'}`}>
        {table.type}
      </span>
    </div>
    <div className="p-3">
      {table.columns.map(col => (
        <div key={col.name} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-800/50 last:border-0">
          <div className="flex items-center gap-2">
            {col.key && <span className={`font-black text-[9px] ${col.key === 'PK' ? 'text-amber-500' : 'text-purple-400'}`}>{col.key}</span>}
            <span className="mono text-gray-300">{col.name}</span>
          </div>
          <span className="text-gray-500 mono">{col.type}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [tasks, setTasks] = useState<PipelineTask[]>(INITIAL_TASKS);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Pipeline initialized. Ready for execution.']);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('Run the pipeline to generate AI insights.');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Generate mock metrics
  useEffect(() => {
    const data = Array.from({ length: 20 }).map((_, i) => ({
      time: i,
      throughput: 500 + Math.random() * 200,
      latency: 40 + Math.random() * 30,
      errors: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0
    }));
    setMetrics(data);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const performFetch = async (taskId: string) => {
    let url = '';
    let description = '';

    switch (taskId) {
      case 'extract_world_news':
        url = 'https://api.worldnewsapi.com/top-news?source-country=us&language=en&api-key=78ba0a3f03364ea5bf69bbaf0c915098';
        description = 'World News API';
        break;
      case 'extract_world_bank':
        url = 'https://api.worldbank.org/v2/region?format=json';
        description = 'World Bank Regions API';
        break;
      case 'extract_pony_api':
        url = 'https://ponyapi.net/v1/character/all';
        description = 'PonyAPI Characters';
        break;
      default:
        return true;
    }

    try {
      addLog(`[FETCH] Requesting ${description}...`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      
      // Log some snippet of data
      if (Array.isArray(data)) {
        addLog(`[FETCH] Received ${data.length} items from ${description}.`);
      } else if (data.top_news) {
        addLog(`[FETCH] Received top news articles from ${description}.`);
      } else {
        addLog(`[FETCH] Success! Received payload from ${description}.`);
      }
      return true;
    } catch (err: any) {
      addLog(`[ERROR] ${description} failed: ${err.message}. Check for CORS or Network issues.`);
      return false;
    }
  };

  const runPipeline = useCallback(async () => {
    if (isPipelineRunning) return;
    
    setIsPipelineRunning(true);
    setTasks(prev => prev.map(t => ({ ...t, status: TaskStatus.IDLE })));
    addLog('Pipeline run started. Initializing parallel ingestion...');

    const taskQueue = [...tasks];
    let pipelineFailed = false;

    for (const task of taskQueue) {
      if (pipelineFailed) {
         setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: TaskStatus.SKIPPED } : t));
         continue;
      }

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: TaskStatus.RUNNING } : t));
      addLog(`Task '${task.name}' started.`);
      
      let success = true;
      if (task.category === 'Ingestion') {
        success = await performFetch(task.id);
      } else {
        // Simulation for other phases
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        success = Math.random() > 0.02; // Very low failure for non-ingestion
      }
      
      const finalStatus = success ? TaskStatus.SUCCESS : TaskStatus.FAILED;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: finalStatus } : t));
      
      if (!success) {
        addLog(`Pipeline execution halted at task: ${task.name}`);
        pipelineFailed = true;
      } else {
        addLog(`Task '${task.name}' finished successfully.`);
      }
    }

    setIsPipelineRunning(false);
    addLog(`Pipeline run ${pipelineFailed ? 'FAILED' : 'COMPLETED'}.`);
    fetchInsights();
  }, [isPipelineRunning, tasks]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    const result = await getPipelineInsights({ tasks, logs });
    setAiInsights(result || 'No insights available.');
    setIsLoadingInsights(false);
  };

  return (
    <div className="flex h-screen bg-[#0f0f12] text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0a0c] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ICONS.Cpu />
          </div>
          <h1 className="text-xl font-bold tracking-tight">DataPipe<span className="text-blue-500">Pro</span></h1>
        </div>

        <nav className="flex-1 mt-4">
          <SidebarItem id="pipeline" label="DAG Orchestrator" icon={<ICONS.Flow />} active={activeTab === 'pipeline'} onClick={setActiveTab} />
          <SidebarItem id="dashboard" label="Analytics Dashboard" icon={<ICONS.Chart />} active={activeTab === 'dashboard'} onClick={setActiveTab} />
          <SidebarItem id="schema" label="Data Schema (DW)" icon={<ICONS.Database />} active={activeTab === 'schema'} onClick={setActiveTab} />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 shadow-xl">
             <div className="flex items-center gap-2 mb-2">
               <ICONS.Sparkles />
               <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Pipeline AI</span>
             </div>
             <p className="text-[11px] leading-relaxed text-gray-400 italic">
               {isLoadingInsights ? 'Thinking...' : aiInsights}
             </p>
             <button 
                onClick={fetchInsights}
                disabled={isLoadingInsights}
                className="mt-3 w-full py-1.5 text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded font-bold uppercase transition-all"
             >
                Refresh Insights
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 px-8 flex items-center justify-between bg-[#0f0f12]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-300">
              {activeTab === 'pipeline' && 'E2E Dag - Multi-Source Real Integration'}
              {activeTab === 'dashboard' && 'Ingestion Performance Metrics'}
              {activeTab === 'schema' && 'Data Architecture & Mapping'}
            </h2>
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-[10px] font-bold text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              PROD-CLUSTER-NODE
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={runPipeline}
              disabled={isPipelineRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isPipelineRunning 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              {isPipelineRunning ? <ICONS.Stop /> : <ICONS.Play />}
              {isPipelineRunning ? 'RUNNING...' : 'EXECUTE PIPELINE'}
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'pipeline' && (
            <div className="flex flex-col h-full space-y-8">
              {/* DAG Visualization */}
              <section className="relative p-8 bg-gray-900/30 rounded-2xl border border-gray-800/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                   {/* Ingestion */}
                   <div className="space-y-4">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Ingestion</h5>
                      {tasks.filter(t => t.category === 'Ingestion').map(t => <TaskNode key={t.id} task={t} />)}
                   </div>
                   {/* Processing */}
                   <div className="space-y-4">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Processing</h5>
                      {tasks.filter(t => t.category === 'Processing').map(t => <TaskNode key={t.id} task={t} />)}
                   </div>
                   {/* Storage */}
                   <div className="space-y-4">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Storage</h5>
                      {tasks.filter(t => t.category === 'Storage').map(t => <TaskNode key={t.id} task={t} />)}
                   </div>
                   {/* Analytics */}
                   <div className="space-y-4">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Analytics</h5>
                      {tasks.filter(t => t.category === 'Analytics').map(t => <TaskNode key={t.id} task={t} />)}
                   </div>
                </div>
              </section>

              {/* Logs */}
              <section className="flex-1 min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Live Execution Logs</h3>
                  <button onClick={() => setLogs([])} className="text-[10px] text-gray-600 hover:text-gray-400">Clear Logs</button>
                </div>
                <div 
                  ref={logContainerRef}
                  className="flex-1 bg-black/50 rounded-xl border border-gray-800 p-4 mono text-[13px] overflow-auto"
                >
                  {logs.map((log, i) => (
                    <div key={i} className="py-0.5 border-l-2 border-transparent hover:border-blue-500/30 hover:bg-white/5 pl-2">
                      <span className="text-gray-600 mr-2">[{i.toString().padStart(3, '0')}]</span>
                      <span className={log.includes('FAILED') || log.includes('ERROR') ? 'text-rose-400' : log.includes('SUCCESS') || log.includes('FETCH') ? 'text-emerald-400' : 'text-gray-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6">Real-time Stream Ingestion Rate</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <defs>
                        <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Area type="monotone" dataKey="throughput" stroke="#3b82f6" fillOpacity={1} fill="url(#colorThroughput)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6">Network Latency (ms)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                      <Line type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Objects Ingested', value: '1.24K', trend: '+100%', color: 'text-emerald-400' },
                  { label: 'Data Source Uptime', value: '99.9%', trend: '+0.1%', color: 'text-blue-400' },
                  { label: 'Active Endpoints', value: '3', trend: 'stable', color: 'text-rose-400' },
                  { label: 'API Quota Used', value: '12%', trend: '-4%', color: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-900/30 border border-gray-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-[10px] font-bold text-gray-600">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                 <div className="p-3 bg-blue-600 rounded-lg">
                   <ICONS.Database />
                 </div>
                 <div>
                   <h3 className="font-bold text-blue-400">PostgreSQL Star Schema</h3>
                   <p className="text-sm text-gray-400">Production Data Warehouse Map</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {DATA_SCHEMA.map((table) => (
                  <SchemaCard key={table.name} table={table} />
                ))}
              </div>

              <div className="p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Ingestion Logic (Node.js/Python Hybrid)</h3>
                <pre className="mono text-[13px] text-gray-400 bg-black/40 p-6 rounded-xl overflow-x-auto">
{`import requests
import json

def fetch_data(url, source_name):
    print(f"Ingesting from {source_name}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Storage logic here
        return data
    except Exception as e:
        print(f"FAILED: {str(e)}")
        return None

# Endpoints provided by user:
world_news = fetch_data("https://api.worldnewsapi.com/...", "World News")
world_bank = fetch_data("https://api.worldbank.org/...", "World Bank")
pony_api = fetch_data("https://ponyapi.net/...", "Pony API")
`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}

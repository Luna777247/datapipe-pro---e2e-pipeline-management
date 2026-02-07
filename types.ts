
export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export interface PipelineTask {
  id: string;
  name: string;
  category: 'Ingestion' | 'Processing' | 'Storage' | 'Analytics';
  status: TaskStatus;
  dependencies: string[];
  logs: string[];
  startTime?: number;
  endTime?: number;
}

export interface SchemaTable {
  name: string;
  type: 'Fact' | 'Dimension';
  columns: { name: string; type: string; key?: 'PK' | 'FK' }[];
}

export interface MetricData {
  timestamp: string;
  processed: number;
  errors: number;
  latency: number;
}

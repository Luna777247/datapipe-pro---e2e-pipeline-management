
import React from 'react';
import { PipelineTask, TaskStatus, SchemaTable } from './types';

export const INITIAL_TASKS: PipelineTask[] = [
  {
    id: 'extract_world_news',
    name: 'World News API (Top US News)',
    category: 'Ingestion',
    status: TaskStatus.IDLE,
    dependencies: [],
    logs: []
  },
  {
    id: 'extract_world_bank',
    name: 'World Bank Regions API',
    category: 'Ingestion',
    status: TaskStatus.IDLE,
    dependencies: [],
    logs: []
  },
  {
    id: 'extract_pony_api',
    name: 'PonyAPI Characters',
    category: 'Ingestion',
    status: TaskStatus.IDLE,
    dependencies: [],
    logs: []
  },
  {
    id: 'clean_and_merge',
    name: 'Pandas Data Merge & Cleaning',
    category: 'Processing',
    status: TaskStatus.IDLE,
    dependencies: ['extract_world_news', 'extract_world_bank', 'extract_pony_api'],
    logs: []
  },
  {
    id: 'spark_transform',
    name: 'PySpark Sentiment Analysis',
    category: 'Processing',
    status: TaskStatus.IDLE,
    dependencies: ['clean_and_merge'],
    logs: []
  },
  {
    id: 'load_dw',
    name: 'PostgreSQL DW Sync',
    category: 'Storage',
    status: TaskStatus.IDLE,
    dependencies: ['spark_transform'],
    logs: []
  },
  {
    id: 'refresh_dashboards',
    name: 'Dashboard Cache Update',
    category: 'Analytics',
    status: TaskStatus.IDLE,
    dependencies: ['load_dw'],
    logs: []
  }
];

export const DATA_SCHEMA: SchemaTable[] = [
  {
    name: 'fact_api_data',
    type: 'Fact',
    columns: [
      { name: 'id', type: 'UUID', key: 'PK' },
      { name: 'source_id', type: 'INT', key: 'FK' },
      { name: 'raw_content', type: 'JSONB' },
      { name: 'processed_at', type: 'TIMESTAMP' },
      { name: 'quality_score', type: 'FLOAT' }
    ]
  },
  {
    name: 'dim_sources',
    type: 'Dimension',
    columns: [
      { name: 'source_id', type: 'INT', key: 'PK' },
      { name: 'api_name', type: 'VARCHAR' },
      { name: 'endpoint_url', type: 'TEXT' },
      { name: 'frequency', type: 'VARCHAR' }
    ]
  },
  {
    name: 'dim_regions',
    type: 'Dimension',
    columns: [
      { name: 'region_code', type: 'VARCHAR', key: 'PK' },
      { name: 'region_name', type: 'VARCHAR' },
      { name: 'iso_code', type: 'VARCHAR' }
    ]
  }
];

export const ICONS = {
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  ),
  Stop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>
  ),
  Cpu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5m-15 7.5H3m18 0h-1.5m-15-7.5 1.5-1.5M19.5 8.25l-1.5-1.5m-10.5 10.5 1.5 1.5m10.5-10.5-1.5 1.5m-3-9v1.5M8.25 19.5V21m7.5-18v1.5m0 15V21m-7.5-15h7.5A2.25 2.25 0 0 1 18 8.25v7.5A2.25 2.25 0 0 1 15.75 18H8.25A2.25 2.25 0 0 1 6 15.75v-7.5A2.25 2.25 0 0 1 8.25 6Z" />
    </svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75m-16.5-3.75v3.75" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
  ),
  Flow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
};

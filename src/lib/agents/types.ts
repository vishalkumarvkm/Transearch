import type { ReactNode } from 'react';

export type AgentDef = {
  id: string;
  label: string;
  agentName: string;
  role: string;
  tagline: string;
  languages: string;
  icon: ReactNode;
  accentHex: string;
  voiceName: string;
  systemInstruction: string;
  greeting?: string;
};

export type AgentDef = {
  id: string;
  label: string;
  agentName: string;
  role: string;
  tagline: string;
  languages: string;
  icon?: string;
  accentHex: string;
  voiceName: string;
  systemInstruction: string;
  greeting?: string;
};

import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_JUAN } from './speechDnaTransearchJuan';

const OPENING_GREETING = "Hello, Juan. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH, one of the world's leading executive search and leadership consulting firms. Thank you for taking a few moments to speak with me. Juan, would you like to continue our conversation at this time?";

export const transearchJuanAgent: AgentDef = {
  id: 'transearch-juan',
  label: 'TRANSEARCH Executive Search (Juan Zepeda)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Juan P. Zepeda (Private Advisory) for Oxane Partners Head of Sales (US)',
  languages: 'English',
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_JUAN,
  greeting: OPENING_GREETING,
};

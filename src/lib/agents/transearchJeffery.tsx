import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_JEFFERY } from './speechDnaTransearchJeffery';

const OPENING_GREETING = "Hello, Jeffery. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH, one of the world's leading executive search and leadership consulting firms. Thank you for taking a few moments to speak with me. Jeffery, would you like to continue our conversation at this time?";

export const transearchJefferyAgent: AgentDef = {
  id: 'transearch-jeffery',
  label: 'TRANSEARCH Executive Search (Jeffery Reiss)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Jeffery L. Reiss (AllianceBernstein) for Oxane Partners Head of Sales (US)',
  languages: 'English',
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_JEFFERY,
  greeting: OPENING_GREETING,
};

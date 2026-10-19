import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_EARC_SUMIT } from './speechDnaTransearchEarcSumit';

const OPENING_GREETING = "Hello, Sumit. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH International — one of the world's leading executive search and leadership consulting firms, with a presence in more than 40 countries. We advise Boards and senior leadership teams on business-critical executive appointments globally. Thank you for taking a few moments to speak with me. Sumit, would you like to continue our conversation at this time?";

export const transearchEarcSumitAgent: AgentDef = {
  id: 'transearch-earc-sumit',
  label: 'TRANSEARCH Executive Search (Sumit Kumar - EARC)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Sumit Kumar (Axis Bank) for EARC Head of Analytics (Gurgaon)',
  languages: 'English',
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_EARC_SUMIT,
  greeting: OPENING_GREETING,
};

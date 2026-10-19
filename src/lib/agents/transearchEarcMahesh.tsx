import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_EARC_MAHESH } from './speechDnaTransearchEarcMahesh';

const OPENING_GREETING = "Hello, Mahesh. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH International — one of the world's leading executive search and leadership consulting firms, with a presence in more than 40 countries. We advise Boards and senior leadership teams on business-critical executive appointments globally. Thank you for taking a few moments to speak with me. Mahesh, would you like to continue our conversation at this time?";

export const transearchEarcMaheshAgent: AgentDef = {
  id: 'transearch-earc-mahesh',
  label: 'TRANSEARCH Executive Search (Dhan Mahesh Nakka - EARC)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Dhan Mahesh Nakka (IndusInd Bank) for EARC Head of Analytics (Gurgaon)',
  languages: 'English',
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_EARC_MAHESH,
  greeting: OPENING_GREETING,
};

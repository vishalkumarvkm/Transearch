import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_EARC } from './speechDnaTransearchEarc';

const OPENING_GREETING = "Hello, Ankit. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH International — one of the world's leading executive search and leadership consulting firms, with a presence in more than 40 countries. We advise Boards and senior leadership teams on business-critical executive appointments globally. Thank you for taking a few moments to speak with me. Ankit, would you like to continue our conversation at this time?";

export const transearchEarcAgent: AgentDef = {
  id: 'transearch-earc',
  label: 'TRANSEARCH Executive Search (Encore ARC - Head of Analytics)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Executive search outreach for Head of Analytics at Encore Asset Reconstruction Company (EARC)',
  languages: 'English',
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_EARC,
  greeting: OPENING_GREETING,
};

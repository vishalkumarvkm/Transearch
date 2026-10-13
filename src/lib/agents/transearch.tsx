import { TransearchIcon } from '@/components/icons/TransearchIcon';
import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA } from './speechDnaTransearch';

const OPENING_GREETING = "Hello. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH International — one of the world's leading executive search and leadership consulting firms, with a presence in more than 40 countries. We advise Boards and senior leadership teams on business-critical executive appointments globally. Thank you for taking a few moments to speak with me. Is this a convenient time for a brief conversation?";

export const transearchAgent: AgentDef = {
  id: 'transearch',
  label: 'TRANSEARCH Executive Search',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Connect with Sara to explore confidential executive search opportunities at TRANSEARCH International',
  languages: 'English',
  icon: <TransearchIcon className="w-5 h-5" />,
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA,
  greeting: OPENING_GREETING,
};

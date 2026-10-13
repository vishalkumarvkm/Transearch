import { TransearchIcon } from '@/components/icons/TransearchIcon';
import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_SOPHIE } from './speechDnaTransearchSophie';

const OPENING_GREETING = "Hello, Sophie. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH International — one of the world's leading executive search and leadership consulting firms, with a presence in more than 40 countries. We advise Boards and senior leadership teams on business-critical executive appointments globally. Thank you for taking a few moments to speak with me. Sophie, would you like to continue our conversation at this time?";

export const transearchSophieAgent: AgentDef = {
  id: 'transearch-sophie',
  label: 'TRANSEARCH Executive Search (Sophie Laurent)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Sophie Laurent (Veeva Systems) at TRANSEARCH International',
  languages: 'English',
  icon: <TransearchIcon className="w-5 h-5" />,
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_SOPHIE,
  greeting: OPENING_GREETING,
};

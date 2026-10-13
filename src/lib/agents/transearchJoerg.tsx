import { TransearchIcon } from '@/components/icons/TransearchIcon';
import type { AgentDef } from './types';
import { TRANSEARCH_SPEECH_DNA_JOERG } from './speechDnaTransearchJoerg';

const OPENING_GREETING = "Hello, Steven. My name is Sara, and I am a Senior Executive Search Consultant with TRANSEARCH, one of the world's leading executive search and leadership consulting firms. Thank you for taking a few moments to speak with me. Steven, would you like to continue our conversation at this time?";

export const transearchJoergAgent: AgentDef = {
  id: 'transearch-joerg',
  label: 'TRANSEARCH Executive Search (Steven Joerg)',
  agentName: 'Sara',
  role: 'Senior Executive Search Consultant',
  tagline: 'Personalized executive search outreach for Steven V. Joerg Jr. (TekSkills Inc.) for Oxane Partners Head of Sales (US)',
  languages: 'English',
  icon: <TransearchIcon className="w-5 h-5" />,
  accentHex: '#0D1B2A',
  voiceName: 'Aoede',
  systemInstruction: TRANSEARCH_SPEECH_DNA_JOERG,
  greeting: OPENING_GREETING,
};

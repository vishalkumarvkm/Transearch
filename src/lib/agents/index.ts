import type { AgentDef } from './types';
export type { AgentDef };

import { transearchAgent } from './transearch';
import { transearchEarcAgent } from './transearchEarc';
import { transearchEarcRockeyAgent } from './transearchEarcRockey';
import { transearchEarcRanvijayAgent } from './transearchEarcRanvijay';
import { transearchEarcSumitAgent } from './transearchEarcSumit';
import { transearchEarcMaheshAgent } from './transearchEarcMahesh';
import { transearchJefferyAgent } from './transearchJeffery';
import { transearchJuanAgent } from './transearchJuan';
import { transearchSchlowAgent } from './transearchSchlow';
import { transearchJoergAgent } from './transearchJoerg';
import { transearchDavidAgent } from './transearchDavid';
import { transearchSophieAgent } from './transearchSophie';

export {
  transearchAgent,
  transearchEarcAgent,
  transearchEarcRockeyAgent,
  transearchEarcRanvijayAgent,
  transearchEarcSumitAgent,
  transearchEarcMaheshAgent,
  transearchJefferyAgent,
  transearchJuanAgent,
  transearchSchlowAgent,
  transearchJoergAgent,
  transearchDavidAgent,
  transearchSophieAgent,
};

export interface TransearchAssignment {
  id: string;
  slug: string;
  title: string;
  client: string;
  clientLogo?: string;
  candidateName?: string;
  role: string;
  location: string;
  description: string;
  agent: AgentDef;
  route: string;
  confidentialBadge: string;
}

export const TRANSEARCH_ASSIGNMENTS: TransearchAssignment[] = [
  {
    id: 'transearch-general',
    slug: 'switzerland-client-partner',
    title: 'Global Client Partner Assignment',
    client: 'TRANSEARCH International',
    clientLogo: '/image001.gif',
    role: 'AVP – Client Partner',
    location: 'Switzerland (Basel / Zurich)',
    description: 'Senior leadership assignment outreach on behalf of TRANSEARCH International for a Client Partner vacancy in Switzerland.',
    agent: transearchAgent,
    route: '/switzerland-client-partner',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-earc-sumit',
    slug: 'earc-analytics-sumit-kumar',
    title: 'Head of Analytics (Sumit Kumar)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Sumit Kumar',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Personalized executive consultation with Sumit Kumar (Axis Bank) for the Head of Analytics mandate at EARC.',
    agent: transearchEarcSumitAgent,
    route: '/earc-analytics-sumit-kumar',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-rockey',
    slug: 'earc-analytics-rockey-maheshwari',
    title: 'Head of Analytics (Rockey Maheshwari)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Rockey Maheshwari',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Personalized executive consultation with Rockey Maheshwari (Stashfin) for the Head of Analytics mandate at EARC.',
    agent: transearchEarcRockeyAgent,
    route: '/earc-analytics-rockey-maheshwari',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-ranvijay',
    slug: 'earc-analytics-ran-vijay-singh',
    title: 'Head of Analytics (Ran Vijay Singh)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Ran Vijay Singh',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Personalized executive consultation with Ran Vijay Singh (Progcap) for the Head of Analytics mandate at EARC.',
    agent: transearchEarcRanvijayAgent,
    route: '/earc-analytics-ran-vijay-singh',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-mahesh',
    slug: 'earc-analytics-dhan-mahesh-nakka',
    title: 'Head of Analytics (Dhan Mahesh Nakka)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Dhan Mahesh Nakka',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Personalized executive consultation with Dhan Mahesh Nakka (IndusInd Bank) for the Head of Analytics mandate at EARC.',
    agent: transearchEarcMaheshAgent,
    route: '/earc-analytics-dhan-mahesh-nakka',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-amit',
    slug: 'earc-analytics-amit-kumar',
    title: 'Head of Analytics Assignment (Amit Kumar)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Amit',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Executive search briefing with candidate Amit Kumar regarding the business-critical Head of Analytics leadership appointment at EARC.',
    agent: transearchEarcAgent,
    route: '/earc-analytics-amit-kumar',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-ankit',
    slug: 'earc-analytics-ankit-kumar',
    title: 'Head of Analytics Assignment (Ankit Kumar)',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Ankit',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Senior leadership opportunity briefing for candidate Ankit regarding the Head of Analytics role at Encore Asset Reconstruction Company.',
    agent: transearchEarcAgent,
    route: '/earc-analytics-ankit-kumar',
    confidentialBadge: 'EXECUTIVE SEARCH BRIEFING'
  },
  {
    id: 'transearch-earc-general',
    slug: 'earc-head-analytics',
    title: 'Encore ARC — Executive Search Mandate',
    client: 'Encore Asset Reconstruction Company (EARC)',
    clientLogo: '/earc-logo.png',
    candidateName: 'Executive Candidate',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    description: 'Specialized executive search discussion for Encore Asset Reconstruction Company leadership assignments.',
    agent: transearchEarcAgent,
    route: '/earc-head-analytics',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-jeffery',
    slug: 'oxane-sales-jeffery-reiss',
    title: 'Head of Sales US (Jeffery Reiss)',
    client: 'Oxane Partners',
    clientLogo: '/oxane-logo.png',
    candidateName: 'Jeffery Reiss',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    description: 'Personalized executive consultation with Jeffery L. Reiss for the Head of Sales US mandate at Oxane Partners.',
    agent: transearchJefferyAgent,
    route: '/oxane-sales-jeffery-reiss',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-juan',
    slug: 'oxane-sales-juan-zepeda',
    title: 'Head of Sales US (Juan Zepeda)',
    client: 'Oxane Partners',
    clientLogo: '/oxane-logo.png',
    candidateName: 'Juan Zepeda',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    description: 'Personalized executive consultation with Juan P. Zepeda for the Head of Sales US mandate at Oxane Partners.',
    agent: transearchJuanAgent,
    route: '/oxane-sales-juan-zepeda',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-schlow',
    slug: 'oxane-sales-steven-schlow',
    title: 'Head of Sales US (Steven Schlow)',
    client: 'Oxane Partners',
    clientLogo: '/oxane-logo.png',
    candidateName: 'Steven Schlow, CFA',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    description: 'Personalized executive consultation with Steven E. Schlow, CFA for the Head of Sales US mandate at Oxane Partners.',
    agent: transearchSchlowAgent,
    route: '/oxane-sales-steven-schlow',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-joerg',
    slug: 'oxane-sales-steven-joerg',
    title: 'Head of Sales US (Steven Joerg)',
    client: 'Oxane Partners',
    clientLogo: '/oxane-logo.png',
    candidateName: 'Steven Joerg Jr.',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    description: 'Personalized executive consultation with Steven V. Joerg Jr. for the Head of Sales US mandate at Oxane Partners.',
    agent: transearchJoergAgent,
    route: '/oxane-sales-steven-joerg',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-david',
    slug: 'indegene-partner-david-schneider',
    title: 'Senior Executive Assignment (David Schneider)',
    client: 'Indegene',
    clientLogo: '/conv_image001.png',
    candidateName: 'David',
    role: 'AVP – Client Partner',
    location: 'Basel / Zurich, Switzerland',
    description: 'Senior leadership assignment discussion with David Schneider on behalf of TRANSEARCH International for Indegene.',
    agent: transearchDavidAgent,
    route: '/indegene-partner-david-schneider',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  },
  {
    id: 'transearch-sophie',
    slug: 'indegene-partner-sophie-laurent',
    title: 'Senior Executive Assignment (Sophie Laurent)',
    client: 'Indegene',
    clientLogo: '/conv_image001.png',
    candidateName: 'Sophie',
    role: 'AVP – Client Partner',
    location: 'Basel / Zurich, Switzerland',
    description: 'Senior leadership assignment discussion with Sophie Laurent on behalf of TRANSEARCH International for Indegene.',
    agent: transearchSophieAgent,
    route: '/indegene-partner-sophie-laurent',
    confidentialBadge: 'CONFIDENTIAL OUTREACH'
  }
];

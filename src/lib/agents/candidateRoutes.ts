import type { AgentDef } from './types';
import {
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
} from './index';

export type VoicePanelType = 'oxane' | 'earc' | 'david' | 'sophie' | 'general';

export interface CandidateRouteConfig {
  id: string;
  slug: string; // Primary canonical slug, e.g. "oxane-sales-jeffery-reiss"
  aliases: string[]; // Variations: "oxane-head-sales-jeffery-reiss", etc.
  candidateGreetingName: string;
  candidateFullName: string;
  clientName: string;
  role: string;
  location: string;
  route: string; // Primary canonical route with leading slash
  panelType: VoicePanelType;
  agent: AgentDef;
  description: string;
}

export const CANDIDATE_CONFIGS: CandidateRouteConfig[] = [
  // =========================================================================
  // Mandate 1: TRANSEARCH × Oxane Partners — Head, Sales (US), New York
  // =========================================================================
  {
    id: 'oxane-jeffery',
    slug: 'oxane-sales-jeffery-reiss',
    aliases: [
      'oxane-head-sales-jeffery-reiss',
      'oxane-head-of-sales-jeffery-reiss',
      'oxane-head-sales-us-jeffery-reiss',
      'oxane-sales-jeffery-l-reiss',
      'oxane-head-sales-jeffery-l-reiss',
      'oxane-sales-jeffery',
      'oxane-head-sales-jeffery',
      'jeffery-reiss',
      'talktosara-jeffery'
    ],
    candidateGreetingName: 'Jeffery',
    candidateFullName: 'Jeffery L. Reiss',
    clientName: 'Oxane Partners',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    route: '/oxane-sales-jeffery-reiss',
    panelType: 'oxane',
    agent: transearchJefferyAgent,
    description: 'Personalized executive consultation with Jeffery L. Reiss for the Head of Sales US mandate at Oxane Partners.'
  },
  {
    id: 'oxane-juan',
    slug: 'oxane-sales-juan-zepeda',
    aliases: [
      'oxane-head-sales-juan-zepeda',
      'oxane-head-of-sales-juan-zepeda',
      'oxane-head-sales-us-juan-zepeda',
      'oxane-sales-juan-p-zepeda',
      'oxane-head-sales-juan-p-zepeda',
      'oxane-sales-juan',
      'oxane-head-sales-juan',
      'juan-zepeda',
      'talktosara-juan'
    ],
    candidateGreetingName: 'Juan',
    candidateFullName: 'Juan P. Zepeda',
    clientName: 'Oxane Partners',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    route: '/oxane-sales-juan-zepeda',
    panelType: 'oxane',
    agent: transearchJuanAgent,
    description: 'Personalized executive consultation with Juan P. Zepeda for the Head of Sales US mandate at Oxane Partners.'
  },
  {
    id: 'oxane-schlow',
    slug: 'oxane-sales-steven-schlow',
    aliases: [
      'oxane-head-sales-steven-schlow',
      'oxane-head-of-sales-steven-schlow',
      'oxane-head-sales-us-steven-schlow',
      'oxane-sales-steven-e-schlow',
      'oxane-head-sales-steven-e-schlow',
      'oxane-sales-schlow',
      'oxane-head-sales-schlow',
      'steven-schlow',
      'talktosara-schlow'
    ],
    candidateGreetingName: 'Steven',
    candidateFullName: 'Steven E. Schlow, CFA',
    clientName: 'Oxane Partners',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    route: '/oxane-sales-steven-schlow',
    panelType: 'oxane',
    agent: transearchSchlowAgent,
    description: 'Personalized executive consultation with Steven E. Schlow, CFA for the Head of Sales US mandate at Oxane Partners.'
  },
  {
    id: 'oxane-joerg',
    slug: 'oxane-sales-steven-joerg',
    aliases: [
      'oxane-head-sales-steven-joerg',
      'oxane-head-of-sales-steven-joerg',
      'oxane-head-sales-us-steven-joerg',
      'oxane-sales-steven-v-joerg',
      'oxane-head-sales-steven-v-joerg',
      'oxane-sales-steven-joerg-jr',
      'oxane-head-sales-steven-joerg-jr',
      'oxane-sales-joerg',
      'oxane-head-sales-joerg',
      'steven-joerg',
      'talktosara-joerg'
    ],
    candidateGreetingName: 'Steven',
    candidateFullName: 'Steven V. Joerg Jr.',
    clientName: 'Oxane Partners',
    role: 'Head of Sales – United States',
    location: 'New York, USA',
    route: '/oxane-sales-steven-joerg',
    panelType: 'oxane',
    agent: transearchJoergAgent,
    description: 'Personalized executive consultation with Steven V. Joerg Jr. for the Head of Sales US mandate at Oxane Partners.'
  },

  // =========================================================================
  // Mandate 2: TRANSEARCH India × EARC — Head, Analytics, Gurgaon
  // =========================================================================
  {
    id: 'earc-sumit',
    slug: 'earc-analytics-sumit-kumar',
    aliases: [
      'earc-head-analytics-sumit-kumar',
      'earc-head-of-analytics-sumit-kumar',
      'earc-analytics-sumit',
      'earc-head-analytics-sumit',
      'sumit-kumar',
      'talktosara-sumit'
    ],
    candidateGreetingName: 'Sumit',
    candidateFullName: 'Sumit Kumar',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-sumit-kumar',
    panelType: 'earc',
    agent: transearchEarcSumitAgent,
    description: 'Personalized executive consultation with Sumit Kumar for the Head of Analytics mandate at EARC.'
  },
  {
    id: 'earc-rockey',
    slug: 'earc-analytics-rockey-maheshwari',
    aliases: [
      'earc-head-analytics-rockey-maheshwari',
      'earc-head-of-analytics-rockey-maheshwari',
      'earc-analytics-rockey',
      'earc-head-analytics-rockey',
      'rockey-maheshwari',
      'talktosara-rockey'
    ],
    candidateGreetingName: 'Rockey',
    candidateFullName: 'Rockey Maheshwari',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-rockey-maheshwari',
    panelType: 'earc',
    agent: transearchEarcRockeyAgent,
    description: 'Personalized executive consultation with Rockey Maheshwari for the Head of Analytics mandate at EARC.'
  },
  {
    id: 'earc-ranvijay',
    slug: 'earc-analytics-ran-vijay-singh',
    aliases: [
      'earc-head-analytics-ran-vijay-singh',
      'earc-head-of-analytics-ran-vijay-singh',
      'earc-analytics-ranvijay-singh',
      'earc-head-analytics-ranvijay-singh',
      'earc-analytics-ran-vijay',
      'earc-analytics-ranvijay',
      'earc-head-analytics-ranvijay',
      'ran-vijay-singh',
      'talktosara-ranvijay'
    ],
    candidateGreetingName: 'Ran Vijay',
    candidateFullName: 'Ran Vijay Singh',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-ran-vijay-singh',
    panelType: 'earc',
    agent: transearchEarcRanvijayAgent,
    description: 'Personalized executive consultation with Ran Vijay Singh for the Head of Analytics mandate at EARC.'
  },
  {
    id: 'earc-mahesh',
    slug: 'earc-analytics-dhan-mahesh-nakka',
    aliases: [
      'earc-head-analytics-dhan-mahesh-nakka',
      'earc-head-of-analytics-dhan-mahesh-nakka',
      'earc-analytics-dhan-mahesh',
      'earc-head-analytics-dhan-mahesh',
      'earc-analytics-mahesh-nakka',
      'earc-head-analytics-mahesh-nakka',
      'earc-analytics-mahesh',
      'earc-head-analytics-mahesh',
      'dhan-mahesh-nakka',
      'talktosara-mahesh'
    ],
    candidateGreetingName: 'Mahesh',
    candidateFullName: 'Dhan Mahesh Nakka',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-dhan-mahesh-nakka',
    panelType: 'earc',
    agent: transearchEarcMaheshAgent,
    description: 'Personalized executive consultation with Dhan Mahesh Nakka for the Head of Analytics mandate at EARC.'
  },

  // =========================================================================
  // Additional EARC & General Mandates
  // =========================================================================
  {
    id: 'earc-amit',
    slug: 'earc-analytics-amit-kumar',
    aliases: [
      'earc-head-analytics-amit-kumar',
      'earc-analytics-amit',
      'earc-head-analytics-amit',
      'amit-kumar',
      'talktosara-amit'
    ],
    candidateGreetingName: 'Amit',
    candidateFullName: 'Amit Kumar',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-amit-kumar',
    panelType: 'earc',
    agent: transearchEarcAgent,
    description: 'Executive briefing regarding the Head of Analytics appointment at EARC.'
  },
  {
    id: 'earc-ankit',
    slug: 'earc-analytics-ankit-kumar',
    aliases: [
      'earc-head-analytics-ankit-kumar',
      'earc-analytics-ankit',
      'earc-head-analytics-ankit',
      'ankit-kumar',
      'talktosara-ankit'
    ],
    candidateGreetingName: 'Ankit',
    candidateFullName: 'Ankit Kumar',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-analytics-ankit-kumar',
    panelType: 'earc',
    agent: transearchEarcAgent,
    description: 'Executive briefing regarding the Head of Analytics appointment at EARC.'
  },
  {
    id: 'earc-general',
    slug: 'earc-head-analytics',
    aliases: [
      'earc-analytics',
      'talktosara-earc'
    ],
    candidateGreetingName: 'Executive',
    candidateFullName: 'Executive Leadership Candidate',
    clientName: 'Encore Asset Reconstruction Company (EARC)',
    role: 'Head – Analytics',
    location: 'Gurgaon, India',
    route: '/earc-head-analytics',
    panelType: 'earc',
    agent: transearchEarcAgent,
    description: 'Executive search briefing for Encore Asset Reconstruction Company leadership assignments.'
  },

  // =========================================================================
  // Indegene & TRANSEARCH Switzerland Mandates
  // =========================================================================
  {
    id: 'indegene-david',
    slug: 'indegene-partner-david-schneider',
    aliases: [
      'indegene-partner-david',
      'david-schneider',
      'talktotransearch-david'
    ],
    candidateGreetingName: 'David',
    candidateFullName: 'David Schneider',
    clientName: 'Indegene',
    role: 'AVP – Client Partner',
    location: 'Basel / Zurich, Switzerland',
    route: '/indegene-partner-david-schneider',
    panelType: 'david',
    agent: transearchDavidAgent,
    description: 'Senior leadership assignment discussion with David Schneider for Indegene.'
  },
  {
    id: 'indegene-sophie',
    slug: 'indegene-partner-sophie-laurent',
    aliases: [
      'indegene-partner-sophie',
      'sophie-laurent',
      'talktotransearch-sophie'
    ],
    candidateGreetingName: 'Sophie',
    candidateFullName: 'Sophie Laurent',
    clientName: 'Indegene',
    role: 'AVP – Client Partner',
    location: 'Basel / Zurich, Switzerland',
    route: '/indegene-partner-sophie-laurent',
    panelType: 'sophie',
    agent: transearchSophieAgent,
    description: 'Senior leadership assignment discussion with Sophie Laurent for Indegene.'
  },
  {
    id: 'transearch-general',
    slug: 'switzerland-client-partner',
    aliases: [
      'transearch-client-partner-switzerland',
      'switzerland-partner',
      'talktotransearch'
    ],
    candidateGreetingName: 'Executive',
    candidateFullName: 'AVP – Client Partner',
    clientName: 'TRANSEARCH International',
    role: 'AVP – Client Partner',
    location: 'Switzerland (Basel / Zurich)',
    route: '/switzerland-client-partner',
    panelType: 'general',
    agent: transearchAgent,
    description: 'Senior leadership assignment outreach for a Client Partner vacancy in Switzerland.'
  }
];

export function getCandidateConfigBySlug(slug: string): CandidateRouteConfig | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');

  for (const config of CANDIDATE_CONFIGS) {
    if (config.slug === normalized) {
      return config;
    }
    if (config.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return config;
    }
  }

  return undefined;
}

export function getAllCandidateSlugs(): string[] {
  const slugs = new Set<string>();
  for (const config of CANDIDATE_CONFIGS) {
    slugs.add(config.slug);
    for (const alias of config.aliases) {
      slugs.add(alias);
    }
  }
  return Array.from(slugs);
}

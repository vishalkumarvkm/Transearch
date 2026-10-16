import fs from 'fs/promises';
import path from 'path';
import { CallInteraction, CallStats } from './types/interaction';
import { getInteractionsCollection } from './mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'interactions.json');

/**
 * Format duration in seconds to human-readable string (e.g., "2m 15s")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/**
 * Seed realistic executive calls if storage is empty
 */
function getInitialSeedData(): CallInteraction[] {
  const now = new Date();
  const subMinutes = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();

  return [
    {
      id: 'call_seed_001',
      sessionId: 'sess_earc_amit_98231',
      date: new Date(Date.now() - 35 * 60 * 1000).toISOString().split('T')[0],
      time: '19:42:10',
      startedAt: subMinutes(35),
      endedAt: subMinutes(30),
      durationSecs: 312,
      durationFormatted: '5m 12s',
      ipAddress: '103.21.124.66',
      geoLocation: {
        ip: '103.21.124.66',
        city: 'Gurgaon',
        region: 'Haryana',
        country: 'India',
        countryCode: 'IN',
        timezone: 'Asia/Kolkata',
        isLocal: false
      },
      agentId: 'earc-amit',
      agentName: 'Sara (EARC Consultant)',
      mandate: 'Head – Analytics',
      route: '/earc-analytics-amit-kumar',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0',
      deviceType: 'Desktop',
      candidateInfo: {
        name: 'Amit Kumar',
        email: 'amit.kumar@analytics-lead.com',
        phone: '+91 98112 45890',
        currentRole: 'VP Analytics & Risk Modelling',
        notes: 'Interested in EARC mandate. Discussed portfolio recovery models, team size of 24, and board reporting hierarchy.'
      },
      segments: [
        { speaker: 'Assistant', text: 'Hello Amit! I am Sara from TRANSEARCH International. We are conducting an executive search for the Head of Analytics appointment at Encore Asset Reconstruction Company. It is great to speak with you.', timestamp: 1 },
        { speaker: 'User', text: 'Hi Sara, thanks for reaching out. Yes, I saw the briefing note. Could you share more details about the primary challenges for the portfolio analytics team?', timestamp: 8 },
        { speaker: 'Assistant', text: 'Certainly Amit. The mandate oversees retail and SME NPA portfolios, predictive recovery scoring, and developing an enterprise data lake. The role reports directly to the MD & CEO.', timestamp: 18 },
        { speaker: 'User', text: 'That aligns well with my background in debt resolution analytics. What is the expected timeline for executive rounds?', timestamp: 35 },
        { speaker: 'Assistant', text: 'The search committee is scheduling leadership interactions for early next month. I have noted your interest and will coordinate with the Senior Partner at TRANSEARCH.', timestamp: 49 }
      ],
      totalTurns: 5,
      status: 'Lead Captured',
      createdAt: subMinutes(30)
    },
    {
      id: 'call_seed_002',
      sessionId: 'sess_indegene_david_4821',
      date: new Date(Date.now() - 140 * 60 * 1000).toISOString().split('T')[0],
      time: '18:05:40',
      startedAt: subMinutes(140),
      endedAt: subMinutes(134),
      durationSecs: 374,
      durationFormatted: '6m 14s',
      ipAddress: '178.197.234.12',
      geoLocation: {
        ip: '178.197.234.12',
        city: 'Zurich',
        region: 'Zurich',
        country: 'Switzerland',
        countryCode: 'CH',
        timezone: 'Europe/Zurich',
        isLocal: false
      },
      agentId: 'david-indegene',
      agentName: 'David (TRANSEARCH Lead)',
      mandate: 'AVP – Client Partner (Indegene)',
      route: '/indegene-partner-david-schneider',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.4',
      deviceType: 'Desktop',
      candidateInfo: {
        name: 'David Schneider',
        email: 'david.schneider@lifesciences-exec.ch',
        phone: '+41 44 215 8890',
        currentRole: 'Managing Director, Commercial Life Sciences',
        notes: 'Strong engagement regarding DACH pharma client expansion. Compensation expectations aligned with Swiss executive bands.'
      },
      segments: [
        { speaker: 'Assistant', text: 'Good day David. Welcome to TRANSEARCH International. I am briefing you on the AVP Client Partner position with Indegene for enterprise life sciences accounts across Switzerland and DACH.', timestamp: 1 },
        { speaker: 'User', text: 'Hello. Yes, I am familiar with Indegene’s digital health consulting practice. Are the target accounts primarily Big Pharma in Basel?', timestamp: 9 },
        { speaker: 'Assistant', text: 'Exactly David. The remit anchors top-tier pharmaceutical and biotech accounts in Basel and Zurich, focusing on digital clinical trials and commercial transformation.', timestamp: 24 },
        { speaker: 'User', text: 'Understood. My current non-compete allows this sector directly. Please send over the confidential brief.', timestamp: 42 }
      ],
      totalTurns: 4,
      status: 'Lead Captured',
      createdAt: subMinutes(134)
    },
    {
      id: 'call_seed_003',
      sessionId: 'sess_oxane_jeffery_11902',
      date: new Date(Date.now() - 320 * 60 * 1000).toISOString().split('T')[0],
      time: '15:15:20',
      startedAt: subMinutes(320),
      endedAt: subMinutes(316),
      durationSecs: 245,
      durationFormatted: '4m 05s',
      ipAddress: '68.195.89.201',
      geoLocation: {
        ip: '68.195.89.201',
        city: 'New York',
        region: 'New York',
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
        isLocal: false
      },
      agentId: 'jeffery-oxane',
      agentName: 'Sara (Oxane Mandate)',
      mandate: 'Head of Sales US (Oxane Partners)',
      route: '/oxane-sales-jeffery-reiss',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      deviceType: 'Mobile',
      candidateInfo: {
        name: 'Jeffery Reiss',
        email: 'jeffery.reiss@privatecapital.com',
        phone: '+1 (212) 555-0192',
        currentRole: 'Managing Director – FinTech & Private Markets',
        notes: 'Discussed North American institutional sales quota ($12M ARR). Follow up requested with London managing partner.'
      },
      segments: [
        { speaker: 'Assistant', text: 'Welcome Jeffery. I am Sara from TRANSEARCH International. We are conducting the confidential retained search for Oxane Partners for their Head of Sales US appointment.', timestamp: 1 },
        { speaker: 'User', text: 'Hi Sara. Yes, I am interested in how Oxane is positioning their credit valuation software against BlackRock Aladdin and legacy providers.', timestamp: 12 },
        { speaker: 'Assistant', text: 'Oxane specializes deeply in private debt portfolio monitoring and structured credit servicing, offering high-touch bespoke financial engineering alongside their SaaS stack.', timestamp: 29 }
      ],
      totalTurns: 3,
      status: 'Completed',
      createdAt: subMinutes(316)
    },
    {
      id: 'call_seed_004',
      sessionId: 'sess_switzerland_general_0911',
      date: new Date(Date.now() - 720 * 60 * 1000).toISOString().split('T')[0],
      time: '10:20:00',
      startedAt: subMinutes(720),
      endedAt: subMinutes(717),
      durationSecs: 185,
      durationFormatted: '3m 05s',
      ipAddress: '194.230.145.8',
      geoLocation: {
        ip: '194.230.145.8',
        city: 'Geneva',
        region: 'Geneva',
        country: 'Switzerland',
        countryCode: 'CH',
        timezone: 'Europe/Zurich',
        isLocal: false
      },
      agentId: 'switzerland-exec',
      agentName: 'Sara (Switzerland)',
      mandate: 'AVP – Client Partner (Switzerland)',
      route: '/switzerland-client-partner',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/132.0',
      deviceType: 'Desktop',
      candidateInfo: {
        name: 'Elena Rossi',
        email: 'elena.rossi@pharma-exec.eu',
        notes: 'Exploratory inquiry into Switzerland partner role.'
      },
      segments: [
        { speaker: 'Assistant', text: 'Hello, welcome to TRANSEARCH International. I am Sara, executive advisor for our Switzerland practice. How may I assist your career exploration today?', timestamp: 1 },
        { speaker: 'User', text: 'I wanted to know more about the seniority level of the Client Partner role in Basel.', timestamp: 11 },
        { speaker: 'Assistant', text: 'The AVP Client Partner is a senior revenue and relationship leadership role advising Global 500 life sciences boards.', timestamp: 24 }
      ],
      totalTurns: 3,
      status: 'Completed',
      createdAt: subMinutes(717)
    }
  ];
}

/**
 * Ensure data directory and file exist
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File does not exist, seed with initial realistic records
      const initial = getInitialSeedData();
      await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[callStorage] Error ensuring data file:', err);
  }
}

/**
 * Read all interactions from MongoDB (with disk fallback)
 */
export async function getAllInteractions(): Promise<CallInteraction[]> {
  // 1. Try reading directly from MongoDB
  try {
    const col = await getInteractionsCollection();
    if (col) {
      const docs = await col.find({}).sort({ startedAt: -1 }).toArray();
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const { _id, ...rest } = doc;
          return rest as CallInteraction;
        });
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[callStorage] MongoDB read failed, falling back to disk: ${message}`);
  }

  // 2. Fallback to local disk storage
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      // Sort newest first by createdAt / startedAt
      return data.sort((a, b) => {
        const timeA = new Date(a.startedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.startedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }
    return [];
  } catch (err) {
    console.error('[callStorage] Error reading interactions from disk:', err);
    return [];
  }
}

/**
 * Save or update an interaction in MongoDB and local disk
 */
export async function saveInteraction(interaction: CallInteraction): Promise<CallInteraction> {
  // 1. Persist directly into MongoDB
  try {
    const col = await getInteractionsCollection();
    if (col) {
      await col.updateOne(
        { $or: [{ id: interaction.id }, { sessionId: interaction.sessionId }] } as any,
        { $set: interaction as any },
        { upsert: true }
      );
      console.log(`[callStorage] ✅ Persisted interaction ${interaction.id} to MongoDB database`);
    }
  } catch (mongoErr: unknown) {
    const message = mongoErr instanceof Error ? mongoErr.message : String(mongoErr);
    console.warn(`[callStorage] ⚠️ MongoDB direct write failed, backing up to disk: ${message}`);
  }

  // 2. Persist to local disk as safe offline fallback
  await ensureDataFile();
  try {
    let all: CallInteraction[] = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } catch {
      all = [];
    }
    
    // Check if interaction exists by id or sessionId
    const existingIndex = all.findIndex(
      (item) => item.id === interaction.id || (interaction.sessionId && item.sessionId === interaction.sessionId)
    );

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...interaction,
      };
    } else {
      all.unshift(interaction);
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8');
    return interaction;
  } catch (err) {
    console.error('[callStorage] Error saving interaction to disk:', err);
    return interaction;
  }
}

/**
 * Get single interaction by ID
 */
export async function getInteractionById(id: string): Promise<CallInteraction | null> {
  const all = await getAllInteractions();
  return all.find((item) => item.id === id || item.sessionId === id) || null;
}

/**
 * Delete an interaction by ID from MongoDB and disk
 */
export async function deleteInteraction(id: string): Promise<boolean> {
  let deletedFromMongo = false;
  try {
    const col = await getInteractionsCollection();
    if (col) {
      const res = await col.deleteOne({ $or: [{ id }, { sessionId: id }] } as any);
      deletedFromMongo = (res.deletedCount || 0) > 0;
    }
  } catch (mongoErr: unknown) {
    console.warn('[callStorage] MongoDB delete failed:', mongoErr);
  }

  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const all = JSON.parse(raw);
    if (Array.isArray(all)) {
      const filtered = all.filter((item) => item.id !== id && item.sessionId !== id);
      if (filtered.length !== all.length) {
        await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
      }
    }
    return deletedFromMongo;
  } catch (err) {
    console.error('[callStorage] Error deleting interaction from disk:', err);
    return deletedFromMongo;
  }
}

/**
 * Compute aggregate statistics for the dashboard
 */
export async function getCallStats(): Promise<CallStats> {
  const all = await getAllInteractions();
  
  let totalDurationSecs = 0;
  let totalLeadsCaptured = 0;
  const uniqueLocations = new Set<string>();
  const agentCountMap = new Map<string, number>();

  for (const call of all) {
    totalDurationSecs += call.durationSecs || 0;
    
    if (call.status === 'Lead Captured' || (call.candidateInfo && (call.candidateInfo.name || call.candidateInfo.email))) {
      totalLeadsCaptured++;
    }

    const loc = call.geoLocation?.country || call.geoLocation?.city;
    if (loc) {
      uniqueLocations.add(loc);
    }

    const agentKey = call.agentName || call.agentId || 'Unknown Agent';
    agentCountMap.set(agentKey, (agentCountMap.get(agentKey) || 0) + 1);
  }

  const topAgents = Array.from(agentCountMap.entries())
    .map(([agentName, count]) => ({ agentName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalCalls: all.length,
    totalDurationSecs,
    totalDurationFormatted: formatDuration(totalDurationSecs),
    totalLeadsCaptured,
    uniqueLocationsCount: uniqueLocations.size,
    topAgents,
  };
}

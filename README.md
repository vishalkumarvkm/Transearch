# TRANSEARCH International — Executive AI Voice Agents Platform

A dedicated, standalone Next.js application hosting all **TRANSEARCH International** executive search voice agents powered by **Google Gemini Multimodal Live API (`gemini-3.1-flash-live-preview`)**.

This platform provides confidential, nuanced executive search advisory briefings with **Sara**, Senior Executive Search Consultant representing TRANSEARCH International across global practices.

---

## 🏛️ Executive Search Mandates & Routes

| Assignment / Mandate | Candidate | Route | Voice Consultant | Client |
| :--- | :--- | :--- | :--- | :--- |
| **Global Client Partner Practice** | General | [`/talktotransearch`](http://localhost:3000/talktotransearch) | Sara (TRANSEARCH International) | Switzerland Practice |
| **Head – Analytics (Amit Kumar)** | Amit Kumar | [`/talktosara-amit`](http://localhost:3000/talktosara-amit) | Sara (TRANSEARCH India) | Encore Asset Reconstruction (EARC) |
| **Head – Analytics (Ankit Kumar)** | Ankit Kumar | [`/talktosara-ankit`](http://localhost:3000/talktosara-ankit) | Sara (TRANSEARCH India) | Encore Asset Reconstruction (EARC) |
| **Encore ARC General Mandate** | Executive | [`/talktosara-earc`](http://localhost:3000/talktosara-earc) | Sara (TRANSEARCH India) | Encore Asset Reconstruction (EARC) |
| **Head of Sales – United States** | Jeffery Reiss | [`/talktosara-jeffery`](http://localhost:3000/talktosara-jeffery) | Sara (TRANSEARCH US Practice) | Oxane Partners |
| **AVP – Client Partner (David)** | David Schneider | [`/talktotransearch-david`](http://localhost:3000/talktotransearch-david) | Sara (TRANSEARCH Life Sciences) | Indegene |
| **AVP – Client Partner (Sophie)** | Sophie Laurent | [`/talktotransearch-sophie`](http://localhost:3000/talktotransearch-sophie) | Sara (TRANSEARCH Life Sciences) | Indegene |
| **Executive Portal Hub** | All Mandates | [`/`](http://localhost:3000/) | Sara (Interactive Dashboard) | TRANSEARCH International |

---

## 🎨 Executive UI & Aesthetic Features

- **Navy & Gold Executive Palette:** Deep navy (`#0D1B2A`), corporate slate (`#1B365D`), and rich metallic gold (`#D4AF37`).
- **Dynamic Wave Canvas Visualizer:** Real-time multi-harmonic sine waves modulated dynamically by speaking/listening volume.
- **Pulsating Microphone Aura:** Concentric animated rings reacting to live audio RMS amplitudes.
- **Sub-200ms Voice Latency:** Native bi-directional speech-to-speech interaction via Google Gemini Multimodal Live.
- **Audio Resampling Engine:** Custom linear interpolation (`resampleAudio`, `resampleInt16`) to guarantee crystal-clear performance on iOS Safari / macOS hardware sample rates (48kHz &rarr; 16kHz & 24kHz).
- **Mobile Screen Keep-Alive:** Screen Wake Lock API integration to prevent mobile displays from dimming during calls.
- **Interactive Tool Calling:** Real-time lead and candidate interest capture via `capture_lead_and_send_email`.
- **Automatic Transcript Emailing:** Every completed briefing is formatted into an executive transcript and dispatched via SMTP.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js 18+** or **Node.js 20+**
- A **Google Gemini API Key** with access to Gemini Multimodal Live

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your API key and MongoDB settings in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Database Configuration (Transcripts saved directly to DB)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=transearch_voice_db
PYTHON_BACKEND_URL=http://localhost:8000

# Email transcripts (Disabled by default)
ENABLE_EMAIL_TRANSCRIPTS=false
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the TRANSEARCH Executive Portal.

---

## 📁 Project Structure

```
transearch-voice-agents/
├── public/                     # Brand logos, EARC logos, Orxestra logos, favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── voice/token/    # Ephemeral session token generation (Gemini Live)
│   │   │   ├── web-transcript/ # Server-side transcript emailer
│   │   │   └── contact/        # Candidate detail logger
│   │   ├── talktotransearch/   # Switzerland Client Partner page
│   │   ├── talktosara-amit/    # EARC Amit Kumar briefing
│   │   ├── talktosara-ankit/   # EARC Ankit Kumar briefing
│   │   ├── talktosara-earc/    # EARC General briefing
│   │   ├── talktosara-jeffery/ # Oxane Partners Jeffery Reiss briefing
│   │   ├── talktotransearch-david/  # Indegene David Schneider briefing
│   │   ├── talktotransearch-sophie/ # Indegene Sophie Laurent briefing
│   │   ├── globals.css         # Executive Navy & Gold styling
│   │   ├── layout.tsx          # Root layout & metadata
│   │   └── page.tsx            # Executive Hub Portal
│   ├── components/
│   │   ├── TransearchVoicePanel.tsx        # General Switzerland voice modal
│   │   ├── TransearchEarcVoicePanel.tsx    # EARC candidate voice modal
│   │   ├── TransearchJefferyVoicePanel.tsx # Oxane Partners voice modal
│   │   ├── TransearchDavidVoicePanel.tsx   # Indegene David voice modal
│   │   ├── TransearchSophieVoicePanel.tsx  # Indegene Sophie voice modal
│   │   └── icons/TransearchIcon.tsx        # TRANSEARCH SVG emblem
│   └── lib/
│       ├── utils.ts            # Class name merge utilities
│       └── agents/             # Agent definitions & complete system prompts
│           ├── types.ts
│           ├── transearch.tsx
│           ├── transearchEarc.tsx
│           ├── transearchJeffery.tsx
│           ├── transearchDavid.tsx
│           ├── transearchSophie.tsx
│           ├── speechDnaTransearch.ts
│           ├── speechDnaTransearchEarc.ts
│           ├── speechDnaTransearchJeffery.ts
│           ├── speechDnaTransearchDavid.ts
│           └── speechDnaTransearchSophie.ts
├── package.json
├── tsconfig.json
└── next.config.ts
```

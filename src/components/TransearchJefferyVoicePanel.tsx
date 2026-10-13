"use client";

import React from 'react';
import { transearchJefferyAgent } from '@/lib/agents/transearchJeffery';
import TransearchOxaneCandidateVoicePanel, { VoiceState } from './TransearchOxaneCandidateVoicePanel';

export type { VoiceState };

export interface TransearchJefferyVoicePanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export default function TransearchJefferyVoicePanel({
  isOpen,
  onClose,
  candidateName = "Jeffery",
}: TransearchJefferyVoicePanelProps) {
  return (
    <TransearchOxaneCandidateVoicePanel
      agent={transearchJefferyAgent}
      isOpen={isOpen}
      onClose={onClose}
      candidateName={candidateName}
    />
  );
}

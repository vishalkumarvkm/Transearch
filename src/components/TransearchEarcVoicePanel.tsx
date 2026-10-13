"use client";

import React from 'react';
import { transearchEarcAgent } from '@/lib/agents/transearchEarc';
import TransearchCandidateVoicePanel, { VoiceState } from './TransearchCandidateVoicePanel';

export type { VoiceState };

export interface TransearchEarcVoicePanelProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export default function TransearchEarcVoicePanel({
  isOpen,
  onClose,
  candidateName = "Ankit",
}: TransearchEarcVoicePanelProps) {
  return (
    <TransearchCandidateVoicePanel
      agent={transearchEarcAgent}
      isOpen={isOpen}
      onClose={onClose}
      candidateName={candidateName}
    />
  );
}

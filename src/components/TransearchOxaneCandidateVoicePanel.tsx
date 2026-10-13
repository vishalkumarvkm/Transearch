"use client";

import React from 'react';
import TransearchCandidateVoicePanel, {
  TransearchCandidateVoicePanelProps,
  VoiceState,
} from './TransearchCandidateVoicePanel';

export type TransearchOxaneCandidateVoicePanelProps = TransearchCandidateVoicePanelProps;
export type { VoiceState };

export default function TransearchOxaneCandidateVoicePanel(props: TransearchCandidateVoicePanelProps) {
  return <TransearchCandidateVoicePanel {...props} />;
}

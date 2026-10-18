/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AudioAnalysisSnapshot } from '../domain/audio/audioService';

interface WaveformVisualizerProps {
  isRecording: boolean;
  snapshot: AudioAnalysisSnapshot | null;
  stateLabel: 'idle' | 'listening' | 'processing' | 'uncertain' | 'completed';
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  snapshot,
  stateLabel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!isRecording || !snapshot) {
      // Idle state: Subtle animated baseline
      ctx.beginPath();
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.35;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      return;
    }

    const { waveform, frequencies, isSilence } = snapshot;

    // Draw Frequency Bars in background (subtle gold/amber glow)
    const barCount = 32;
    const barWidth = width / barCount;
    for (let i = 0; i < barCount; i++) {
      const freqIdx = Math.floor((i / barCount) * frequencies.length);
      const freqVal = frequencies[freqIdx] || 0;
      const barHeight = (freqVal / 255) * (height * 0.7);

      const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
      grad.addColorStop(0, 'rgba(217, 119, 6, 0.08)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.45)');

      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);
    }

    // Draw Smooth Waveform Line (emerald green)
    ctx.beginPath();
    ctx.lineWidth = isSilence ? 2 : 3;
    ctx.strokeStyle = isSilence ? '#94a3b8' : '#047857';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const sliceWidth = width / (waveform.length - 1);
    let x = 0;

    for (let i = 0; i < waveform.length; i++) {
      const v = waveform[i]; // -1 to 1
      const y = height / 2 + v * (height * 0.42);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
  }, [isRecording, snapshot]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-stone-900/5 border border-emerald-900/10 p-3 shadow-inner">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isRecording
                ? snapshot?.isSilence
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse'
                : 'bg-stone-400'
            }`}
          />
          <span className="text-xs font-semibold tracking-wide uppercase text-stone-600">
            {stateLabel === 'listening' ? (
              snapshot?.isSilence ? 'Listening (Silent)...' : 'Recitation Detected'
            ) : stateLabel === 'processing' ? (
              'Analyzing Phonetics & Tajweed...'
            ) : stateLabel === 'uncertain' ? (
              'Uncertain Signal'
            ) : stateLabel === 'completed' ? (
              'Recitation Captured'
            ) : (
              'Acoustic Waveform Monitor'
            )}
          </span>
        </div>
        {snapshot && isRecording && (
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            Signal: {Math.round(snapshot.averageVolume * 100)}%
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={90}
        className="w-full h-20 rounded-lg bg-stone-950/5"
      />
    </div>
  );
};

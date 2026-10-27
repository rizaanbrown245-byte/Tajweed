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

/**
 * CSS-based frequency visualizer bar strip
 */
export const CssFrequencyVisualizer: React.FC<{
  active: boolean;
  volume?: number;
  barCount?: number;
  className?: string;
}> = ({ active, volume = 0.2, barCount = 18, className = '' }) => {
  // Staggered animation delays for natural acoustic equalizer rhythm
  const delays = [0.1, 0.4, 0.2, 0.7, 0.3, 0.5, 0.2, 0.8, 0.4, 0.6, 0.25, 0.55, 0.35, 0.75, 0.15, 0.45, 0.65, 0.3];
  const heights = [35, 75, 55, 90, 60, 80, 50, 95, 70, 85, 45, 80, 65, 90, 40, 70, 85, 50];

  return (
    <div className={`flex items-end gap-1 h-5 select-none ${className}`}>
      {Array.from({ length: barCount }).map((_, idx) => {
        const delay = delays[idx % delays.length];
        const baseH = heights[idx % heights.length];
        const scaledHeight = active ? Math.max(20, Math.min(100, Math.round(baseH * (0.6 + volume * 1.2)))) : 20;

        return (
          <span
            key={idx}
            className={`w-1 rounded-full transition-all duration-150 ${
              active
                ? 'bg-gradient-to-t from-emerald-600 via-amber-400 to-amber-300 animate-audio-wave'
                : 'bg-emerald-900/30'
            }`}
            style={{
              height: `${scaledHeight}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${0.65 + (idx % 4) * 0.15}s`
            }}
          />
        );
      })}
    </div>
  );
};

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  snapshot,
  stateLabel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const smoothedVolRef = useRef<number>(0);
  const snapshotRef = useRef<AudioAnalysisSnapshot | null>(snapshot);
  const isRecordingRef = useRef<boolean>(isRecording);

  // Keep latest props in refs for 60fps animation loop
  useEffect(() => {
    snapshotRef.current = snapshot;
    isRecordingRef.current = isRecording;
  }, [snapshot, isRecording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const currentSnapshot = snapshotRef.current;
      const recordingActive = isRecordingRef.current;

      // Advance animation phase continuously for organic fluid motion
      phaseRef.current += recordingActive ? 0.08 : 0.02;
      const phase = phaseRef.current;

      // Smooth target volume with lerp
      const targetVol = recordingActive && currentSnapshot && !currentSnapshot.isSilence 
        ? Math.max(0.12, currentSnapshot.averageVolume) 
        : 0.04;
      smoothedVolRef.current += (targetVol - smoothedVolRef.current) * 0.15;
      const vol = smoothedVolRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Background Equalizer Frequency Bars
      if (recordingActive && currentSnapshot?.frequencies?.length) {
        const frequencies = currentSnapshot.frequencies;
        const barCount = 36;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const freqIdx = Math.floor((i / barCount) * (frequencies.length * 0.7));
          const freqVal = frequencies[freqIdx] || 0;
          const normalized = freqVal / 255;
          const barHeight = Math.max(4, normalized * (height * 0.75) * (0.5 + vol * 1.5));

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(6, 78, 59, 0.08)');
          grad.addColorStop(0.6, 'rgba(16, 185, 129, 0.22)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0.4)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(i * barWidth + 1.5, height - barHeight, barWidth - 3, barHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
      }

      // 2. Wave 1: Ambient Glowing Fill (Teal/Emerald soft baseline)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 3) {
        const angle = (x / width) * Math.PI * 4 + phase * 0.8;
        const waveY = height * 0.52 + Math.sin(angle) * (height * 0.12 * (0.3 + vol * 1.4));
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      fillGrad.addColorStop(0, recordingActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(6, 78, 59, 0.06)');
      fillGrad.addColorStop(1, 'rgba(6, 78, 59, 0.01)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // 3. Wave 2: Secondary Harmonic Wave (Emerald stroke)
      ctx.beginPath();
      ctx.lineWidth = recordingActive ? 2.5 : 1.5;
      ctx.strokeStyle = recordingActive ? 'rgba(52, 211, 153, 0.75)' : 'rgba(16, 185, 129, 0.35)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let x = 0; x <= width; x += 3) {
        const angle = (x / width) * Math.PI * 6 - phase * 1.1;
        const harmonic = Math.sin(angle) * Math.cos((x / width) * Math.PI * 2);
        const y = height * 0.5 + harmonic * (height * 0.22 * (0.4 + vol * 1.8));

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Wave 3: Primary Voice Waveform (Glowing Amber / Gold)
      ctx.beginPath();
      ctx.lineWidth = recordingActive ? 3.5 : 2;
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, '#10b981');
      waveGrad.addColorStop(0.35, '#f59e0b');
      waveGrad.addColorStop(0.65, '#fbbf24');
      waveGrad.addColorStop(1, '#10b981');
      ctx.strokeStyle = recordingActive ? waveGrad : 'rgba(5, 150, 105, 0.5)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const waveform = currentSnapshot?.waveform;
      const step = 2;
      for (let x = 0; x <= width; x += step) {
        let waveOffset = 0;
        if (recordingActive && waveform && waveform.length > 0) {
          const sampleIdx = Math.floor((x / width) * (waveform.length - 1));
          waveOffset = (waveform[sampleIdx] || 0) * (height * 0.38);
        }

        const harmonicSine = Math.sin((x / width) * Math.PI * 3.5 + phase * 1.4) * (height * 0.16 * (0.3 + vol * 1.5));
        const y = height * 0.5 + waveOffset + harmonicSine;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 5. Peak Particle Highlights when actively vocalizing
      if (recordingActive && vol > 0.18) {
        const peakCount = 5;
        for (let p = 0; p < peakCount; p++) {
          const px = ((p + 1) / (peakCount + 1)) * width;
          const py = height * 0.5 + Math.sin((px / width) * Math.PI * 3.5 + phase * 1.4) * (height * 0.16 * (0.3 + vol * 1.5));

          ctx.beginPath();
          ctx.arc(px, py, 2.5 + vol * 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const signalPercent = snapshot && isRecording ? Math.round(snapshot.averageVolume * 100) : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900/10 via-emerald-950/20 to-stone-900/20 border border-emerald-500/20 p-3 shadow-inner">
      {/* Visualizer Status & Frequency Indicator Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isRecording
                ? snapshot?.isSilence
                  ? 'bg-amber-400 ring-4 ring-amber-400/20 animate-pulse'
                  : 'bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse'
                : 'bg-stone-500/60'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-100 flex items-center gap-1.5">
              <span>
                {stateLabel === 'listening' ? (
                  snapshot?.isSilence ? 'Listening (Silent)...' : 'Recitation Detected'
                ) : stateLabel === 'processing' ? (
                  'Analyzing Phonetics & Tajweed...'
                ) : stateLabel === 'uncertain' ? (
                  'Recitation Assessed'
                ) : stateLabel === 'completed' ? (
                  'Recitation Captured'
                ) : (
                  'Acoustic Waveform Monitor'
                )}
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic CSS Frequency Bar Animation & Signal Meter */}
        <div className="flex items-center gap-3">
          <CssFrequencyVisualizer 
            active={isRecording && !snapshot?.isSilence} 
            volume={snapshot?.averageVolume || 0.15}
            barCount={14}
          />

          {isRecording && (
            <span className="text-[11px] font-mono font-bold text-amber-300 bg-emerald-950/90 border border-amber-400/30 px-2.5 py-0.5 rounded-full shadow-xs">
              Signal: {signalPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Smooth 60FPS Frequency & Waveform Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-emerald-950/60 border border-emerald-800/40">
        <canvas
          ref={canvasRef}
          width={640}
          height={96}
          className="w-full h-24 block"
        />
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
    </div>
  );
};

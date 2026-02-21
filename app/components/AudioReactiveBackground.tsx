'use client';

import { useEffect, useRef } from 'react';

interface AudioReactiveBackgroundProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

// Colors assigned to each edge: top=green, right=blue, bottom=white, left=dark-teal
const EDGE_BEAMS = [
    { dir: 'top', col: { r: 0, g: 255, b: 120 } },  // green
    { dir: 'right', col: { r: 0, g: 140, b: 255 } },  // blue
    { dir: 'bottom', col: { r: 200, g: 255, b: 240 } },  // near-white / ice
    { dir: 'left', col: { r: 0, g: 200, b: 160 } },  // teal-green
];

export default function AudioReactiveBackground({ videoRef }: AudioReactiveBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // Smooth intensity & beat state
    const smoothIntensityRef = useRef(0);
    const prevRawRef = useRef(0);
    const beatFlashRef = useRef(0); // 0-1, decays each frame

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const initAudio = () => {
            if (!audioContextRef.current) {
                const AC = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AC();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 512;
                // Less smoothing = snappier beat reaction
                analyserRef.current.smoothingTimeConstant = 0.4;

                if (!sourceRef.current) {
                    sourceRef.current = audioContextRef.current.createMediaElementSource(video);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                }
            } else if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        video.addEventListener('play', () => {
            initAudio();
            if (!animationRef.current) draw();
        });

        const draw = () => {
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            const W = canvas.width;
            const H = canvas.height;

            // ── Audio analysis ─────────────────────────────────────────────
            let rawIntensity = 0;

            if (analyserRef.current) {
                const bins = analyserRef.current.frequencyBinCount;
                const data = new Uint8Array(bins);
                analyserRef.current.getByteFrequencyData(data);

                // Heavy bass weighting (sub-bass + kick range)
                const bassEnd = Math.floor(bins * 0.1);
                let bassSum = 0;
                for (let i = 0; i < bassEnd; i++) bassSum += data[i];
                const bassIntensity = bassSum / bassEnd / 255;

                const midEnd = Math.floor(bins * 0.4);
                let midSum = 0;
                for (let i = bassEnd; i < midEnd; i++) midSum += data[i];
                const midIntensity = midSum / (midEnd - bassEnd) / 255;

                rawIntensity = bassIntensity * 0.8 + midIntensity * 0.2;
            }

            // Beat detection: sudden upward spike in intensity
            const prev = prevRawRef.current;
            const delta = rawIntensity - prev;
            if (delta > 0.07) {
                // Beat hit — set flash to boosted value
                beatFlashRef.current = Math.min(rawIntensity * 2.4, 1.0);
            }
            prevRawRef.current = rawIntensity;

            // Decay beat flash
            beatFlashRef.current *= 0.82;
            const beatFlash = beatFlashRef.current;

            // Smooth envelope for ambient pulsing
            const cur = smoothIntensityRef.current;
            const lerpSpeed = rawIntensity > cur ? 0.3 : 0.08;
            smoothIntensityRef.current += (rawIntensity - cur) * lerpSpeed;
            const ambient = smoothIntensityRef.current;

            // Combined: ambient keeps edges alive, beat flash drives the surge
            const combined = Math.min(ambient * 0.4 + beatFlash * 0.85, 1.0);

            // ── Render ─────────────────────────────────────────────────────
            // Pure black base
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, W, H);

            ctx.globalCompositeOperation = 'screen';

            EDGE_BEAMS.forEach(({ dir, col }) => {
                const { r, g, b } = col;

                // At rest (combined=0): thin rim, ~6% of dimension.
                // On full beat (combined=1): surges to ~55% of dimension.
                const restReach = 0.06;
                const beatReach = 0.55;
                const reach = (restReach + (beatReach - restReach) * combined);

                // Alpha: barely visible at rest, bold on beat
                const restAlpha = 0.08;
                const beatAlpha = 0.75;
                const edgeAlpha = restAlpha + (beatAlpha - restAlpha) * combined;

                let grd: CanvasGradient;

                if (dir === 'top') {
                    // Linear gradient from top edge downward
                    grd = ctx.createLinearGradient(0, 0, 0, H * reach);
                    grd.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(3)})`);
                    grd.addColorStop(0.6, `rgba(${r},${g},${b},${(edgeAlpha * 0.3).toFixed(3)})`);
                    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = grd;
                    ctx.fillRect(0, 0, W, H * reach);

                } else if (dir === 'bottom') {
                    grd = ctx.createLinearGradient(0, H, 0, H - H * reach);
                    grd.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(3)})`);
                    grd.addColorStop(0.6, `rgba(${r},${g},${b},${(edgeAlpha * 0.3).toFixed(3)})`);
                    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = grd;
                    ctx.fillRect(0, H - H * reach, W, H * reach);

                } else if (dir === 'right') {
                    grd = ctx.createLinearGradient(W, 0, W - W * reach, 0);
                    grd.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(3)})`);
                    grd.addColorStop(0.6, `rgba(${r},${g},${b},${(edgeAlpha * 0.3).toFixed(3)})`);
                    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = grd;
                    ctx.fillRect(W - W * reach, 0, W * reach, H);

                } else if (dir === 'left') {
                    grd = ctx.createLinearGradient(0, 0, W * reach, 0);
                    grd.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(3)})`);
                    grd.addColorStop(0.6, `rgba(${r},${g},${b},${(edgeAlpha * 0.3).toFixed(3)})`);
                    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = grd;
                    ctx.fillRect(0, 0, W * reach, H);
                }
            });

            ctx.globalCompositeOperation = 'source-over';

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [videoRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
}

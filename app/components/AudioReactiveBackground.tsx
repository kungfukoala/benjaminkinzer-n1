'use client';

import { useEffect, useRef } from 'react';

interface AudioReactiveBackgroundProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function AudioReactiveBackground({ videoRef }: AudioReactiveBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Initialize AudioContext on user interaction if needed
        const initAudio = () => {
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;

                // Connect video to analyser and destination
                if (!sourceRef.current) {
                    sourceRef.current = audioContextRef.current.createMediaElementSource(video);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                }
            } else if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        const handlePlay = () => {
            initAudio();
            draw();
        };

        video.addEventListener('play', handlePlay);

        // Color definitions
        const color1 = { r: 46, g: 2, b: 73 };    // #2E0249 (Deep Purple)
        const color2 = { r: 248, g: 6, b: 204 };  // #F806CC (Magenta)
        const color3 = { r: 0, g: 255, b: 255 };  // #00FFFF (Cyan)

        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average amplitude
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Normalize amplitude (0 to 1)
            const intensity = Math.min(average / 128, 1);

            // Interpolate colors based on intensity
            // Low intensity -> color1
            // Medium intensity -> color2
            // High intensity -> color3

            let r, g, b;

            if (intensity < 0.5) {
                // Interpolate between color1 and color2
                const t = intensity * 2;
                r = color1.r + (color2.r - color1.r) * t;
                g = color1.g + (color2.g - color1.g) * t;
                b = color1.b + (color2.b - color1.b) * t;
            } else {
                // Interpolate between color2 and color3
                const t = (intensity - 0.5) * 2;
                r = color2.r + (color3.r - color2.r) * t;
                g = color2.g + (color3.g - color2.g) * t;
                b = color2.b + (color3.b - color2.b) * t;
            }

            // Smooth transition could be added here, but direct mapping feels more reactive

            // Fill background
            ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationRef.current = requestAnimationFrame(draw);
        };

        return () => {
            video.removeEventListener('play', handlePlay);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Note: We don't close AudioContext immediately to allow reuse, 
            // but in a complex app we might want to manage lifecycle more carefully.
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
                pointerEvents: 'none'
            }}
            width={32}
            height={32} // Small resolution is fine for solid color background
        />
    );
}

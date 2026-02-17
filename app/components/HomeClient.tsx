'use client';

import { useRef } from 'react';
import styles from '../page.module.css';
import AudioReactiveBackground from './AudioReactiveBackground';

export default function HomeClient() {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <main className={styles.main}>
            <AudioReactiveBackground videoRef={videoRef} />
            <h1 className={styles.title} style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Welcome to the Video Feed</h1>
            <div className={styles.videoContainer}>
                {/* 
                  The `crossOrigin` attribute is important for MediaElementSource 
                  if the video is served from a different origin, 
                  but strictly strictly for local files or same-origin it might be optional.
                  Added 'anonymous' to be safe for potential CDN usage later.
                */}
                <video
                    ref={videoRef}
                    controls
                    width="100%"
                    crossOrigin="anonymous"
                    style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                    <source src="/Trailer-2026-n3.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </main>
    );
}

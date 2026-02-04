'use client'

import styles from './page.module.css'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Feed() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Placeholder for actual data fetching
        const fetchFeed = async () => {
            // simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            setLoading(false)
        }

        fetchFeed()
    }, [])

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Feed</h1>
                <p>Latest updates from the community.</p>
            </div>

            <div className={styles.feedGrid}>
                {loading ? (
                    <p>Loading feed...</p>
                ) : (
                    <>
                        <div className={styles.card}>
                            <h2>Sample Post &rarr;</h2>
                            <p>This is a placeholder for dynamic content from Supabase.</p>
                        </div>
                        <div className={styles.card}>
                            <h2>Another Post &rarr;</h2>
                            <p>Real data will appear here once the database is connected.</p>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

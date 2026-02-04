import './globals.css'
import styles from './layout.module.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Video Feed App',
    description: 'A Vercel + Supabase demo',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div className={styles.container}>
                    <nav className={styles.nav}>
                        <div className={styles.navLinks}>
                            <Link href="/" className={styles.link}>Home</Link>
                            <Link href="/feed" className={styles.link}>Feed</Link>
                            <Link href="/about" className={styles.link}>About</Link>
                        </div>
                    </nav>
                    {children}
                </div>
            </body>
        </html>
    )
}

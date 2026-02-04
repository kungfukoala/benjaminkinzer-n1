import styles from './page.module.css'

export default function About() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>About This Project</h1>
            <p className={styles.description}>
                This application demonstrates a highly cost-effective architecture using Next.js on Vercel for the frontend and Supabase for the backend.
            </p>
            <p className={styles.description}>
                The goal is to provide a seamless video feed experience with minimal operational costs, leveraging static site generation where possible and dynamic fetching only when necessary.
            </p>
        </main>
    )
}

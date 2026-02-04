import styles from './page.module.css'

export default function Home() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Welcome to the Video Feed</h1>
            <div className={styles.videoContainer}>
                <video controls width="100%">
                    <source src="/placeholder-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <p className={styles.caption}>Featured Video</p>
            </div>
        </main>
    )
}

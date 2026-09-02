import { HEADSHOT_SRC } from '../data/media'
import styles from './About.module.css'

const CANVAS_REBEL_INTERVIEW_URL = 'https://canvasrebel.com/meet-yazmine-taylor/'

const ABOUT_COPY = [
  'I grew up in Brooklyn with Honduran and Garifuna roots. My mom bought me Black dolls so I could practice braiding their hair. I moved to my sisters\' hair, then friends started asking me to do theirs.',
  'In college, a friend challenged me to retwist his locs. That pull toward loc work stuck. I kept meeting people who couldn\'t find a stylist who took their hair seriously.',
  'I was studying Medical Assistance while working a 9-5 and styling on the side. Full-time student, two part-time jobs, hair in whatever hours I had left. I graduated, left my 9-5 in June 2023, and went full-time with LusciousbyYazmine. I moved from working at home to my own chair in a salon.',
  'I saw thinning roots, buildup, and damage from harsh products take a toll on people I cared about. I made Rosemary & Fenugreek Oil and Batana Butter and debuted them at my first vendor marketplace. When you sit in my chair, the goal is hair that looks healthy and strong again.',
]

export default function About() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading">
      <div className={styles.inner}>
        <div className={styles.imageCol}>
          <img
            className={styles.portrait}
            src={HEADSHOT_SRC}
            alt="Yazmine Taylor"
            decoding="async"
          />
        </div>

        <div className={styles.textCol}>
          <h2 id="about-heading" className={styles.heading}>
            About Yazmine
          </h2>
          {ABOUT_COPY.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <a
            href={CANVAS_REBEL_INTERVIEW_URL}
            className={styles.interviewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Canvas Rebel interview
          </a>
        </div>
      </div>
    </section>
  )
}

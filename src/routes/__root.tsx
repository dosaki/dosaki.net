import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { Mark } from '../components/Mark'
import { site } from '../content/site'
import styles from '../styles/layout.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

const NAV = [
  { to: '/about', label: 'About me' },
  { to: '/projects', label: 'Stuff I make' },
  { to: '/talks', label: 'Stuff I talk about' },
] as const

function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={styles.identity}
            aria-label={`${site.brand.name} — home`}
          >
            <Mark size={44} className={styles.mark} />
            <span className={styles.wordmark}>{site.brand.name}</span>
          </Link>
          <ul className={styles.strapline}>
            {site.brand.strapline.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
        </div>
        <nav>
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} activeProps={{ className: 'active' }}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:tiago.f.a.correia@gmail.com">Talk to me</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <ul className={styles.motto}>
          {site.brand.motto.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </footer>
    </div>
  )
}

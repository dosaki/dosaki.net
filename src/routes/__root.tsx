import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

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
    <div className="layout">
      <header>
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
          <img src="/images/logo.png" alt="Home" height={48} />
        </Link>
        <nav>
          <ul className="nav">
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
      <main>
        <Outlet />
      </main>
    </div>
  )
}

import React from "react"
import { Link } from "gatsby"
import "../layout.css"

import { rhythm } from "../utils/typography"
import ThemeSwitch from "./theme-switch"

// The blog title keeps the exact color it has always rendered at by day (see
// --masthead in layout.css).
const mastheadColor = `var(--masthead)`

class Layout extends React.Component {
  render() {
    // The palette pages set themselves in the palette they describe, so a
    // theme switch has nothing to do there.
    const { location, title, children, themeSwitch = true } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname === rootPath) {
      header = (
        <h1
          className="site-title"
          style={{
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: mastheadColor,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      // Elsewhere the site name is a link home, not a heading: the page's own
      // title is its first heading.
      header = (
        <p className="site-name">
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: mastheadColor,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </p>
      )
    }
    return (
      <>
        {themeSwitch && <ThemeSwitch />}
        <div
          className="site-container"
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            // A measure, not a rhythm multiple: ~68 characters of Merriweather,
            // which is where ft.com sets its body copy.
            maxWidth: `38rem`,
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          }}
        >
          <header>{header}</header>
          <main>{children}</main>
          <footer>
            © {new Date().getFullYear()}
          </footer>
        </div>
      </>
    )
  }
}

export default Layout

import React from "react"
import { Link } from "gatsby"
import "../layout.css"

import { rhythm } from "../utils/typography"

// The blog title keeps the exact color it has always rendered at, independent
// of the body ink.
const mastheadColor = `hsla(0,0%,0%,0.9)`

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
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
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
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
        </h3>
      )
    }
    return (
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
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

export default Layout

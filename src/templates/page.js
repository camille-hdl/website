import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

class PageTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    // const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={page.frontmatter.title}
          lang={page.frontmatter.lang || "en"}
          description={page.frontmatter.description || page.excerpt}
        />
        <h1
          style={{
            marginTop: rhythm(1),
            marginBottom: 0,
          }}
        >
          {page.frontmatter.title}
        </h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: `block`,
            marginBottom: rhythm(1),
          }}
        >
          {page.frontmatter.date}
        </p>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <Bio />
      </Layout>
    )
  }
}

export default PageTemplate

export const pageQuery = graphql`
  query PagePostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        lang
        description
      }
    }
  }
`

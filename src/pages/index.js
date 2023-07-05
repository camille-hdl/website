import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { rhythm } from "../utils/typography"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Seo title="All posts" />
        <Bio />
        <ol style={{ listStyle: `none`, marginLeft: 0 }}>
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <li key={node.fields.slug}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                <header>
                  <h3
                    style={{
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </h3>
                <small>{node.frontmatter.date}</small>
                </header>
                <section>
                <p
                  dangerouslySetInnerHTML={{
                    __html: node.frontmatter.description || node.excerpt,
                  }}
                />
                </section>
                </article>
              </li>
            )
          })}
        </ol>
        <aside id="seneca-quote">
          <blockquote>
          <p>Nothing will ever please me, no matter how excellent or
          beneficial, if I must retain the knowledge of it to myself.
          </p>
          <p>And if wisdom were given me under the express condition
          that it must be kept hidden and not uttered, I should refuse
          it.</p>
          <p>No good thing is pleasant to possess, without friends to
          share it.</p>
          <cite><u>Letters From a Stoic</u>,
            Lucius Annaeus Seneca</cite>
          </blockquote>

        </aside>
      </Layout>
    )
  }
}

export default BlogIndex


export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {fileAbsolutePath: {glob: "**/content/blog/**"}}
      sort: {frontmatter: {date: DESC}}) 
      {
        edges {
          node {
            excerpt
            fields {
              slug
            }
            frontmatter {
              date(formatString: "MMMM DD, YYYY")
              title
              description
            }
          }
        }
    }
  }
`

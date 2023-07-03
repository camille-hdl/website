/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/squircletest.png/" }) {
        childImageSharp {
          fixed(width: 72, height: 72) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          social {
            twitter,
            github,
            flickr
          }
        }
      }
    }
  `)

  const { author, social } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 72,
          // borderRadius: `100%`,
        }}
        imgStyle={{
          // borderRadius: `50%`,
        }}
      />
      <p>
        I'm a JavaScript and PHP developer living in Grenoble, France.
        <br />
        <a href={`https://twitter.com/${social.twitter}`} target="_blank" rel="noopener noreferrer">
          Twitter
        </a>,{" "}
        <a href={`https://github.com/${social.github}`} target="_blank" rel="noopener noreferrer">
          Github
        </a>,{" "}
        <a href={`https://flickr.com/people/${social.flickr}/`} target="_blank" rel="noopener noreferrer">
          Flickr
        </a>,{" "}
        <Link to="/resume">
          resume
        </Link>
      </p>
    </div>
  )
}

export default Bio

/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter,
            github,
            flickr
          }
        }
      }
    }
  `);

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author;
  const social = data.site.siteMetadata?.social;
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <StaticImage
        src="../images/profile-pic.png"
        className="bio-avatar"
        alt={author.name}
        layout="fixed"
        formats={["auto", "webp", "avif"]}
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

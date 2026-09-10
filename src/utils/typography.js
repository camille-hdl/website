import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"

// Colors come from the ft-paper palette — see src/data/ft-paper.js and /palette.
const ink = "#262a33"
const inkMuted = "#6b6259"
const rule = "#b8afa5"
const oxford = "#0f5499"
const claret = "#990f3d"

Wordpress2016.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
    "li": {
      marginBottom: "0",
    },
    "ul, ol": {
      marginLeft: "1rem",
    },
    // Links sit on oxford and turn claret on hover, like ft.com. The underline
    // stays faint until then so a paragraph full of links still reads as prose.
    "a": {
      color: oxford,
      boxShadow: `0 1px 0 0 ${rule}`,
    },
    "a:hover, a:focus": {
      color: claret,
      boxShadow: `0 1px 0 0 currentColor`,
    },
    // The theme hardcodes its own blue on these.
    "mark,ins": {
      background: claret,
      color: "#fff9f2",
    },
    "blockquote cite": {
      color: inkMuted,
    },
    "hr": {
      background: rule,
    },
    // FT headlines are bold, not black, and they set tighter than the body.
    "h1, h2, h3, h4, h5, h6": {
      fontWeight: 700,
      letterSpacing: "-0.005em",
      lineHeight: 1.2,
    },
    "h4, h5, h6": {
      letterSpacing: "0.12em",
    },
    // Step the base size down on phones. Everything else is expressed in rem,
    // so the whole page scales with it.
    "@media only screen and (max-width: 600px)": {
      html: {
        fontSize: "112.5%",
      },
      "blockquote": {
        marginLeft: "-1rem",
        marginRight: "-1rem",
      },
    },
  }
}

delete Wordpress2016.googleFonts
Wordpress2016.baseFontSize = "19px";
// 1.8 left the measure airy to the point of drifting; 1.62 is closer to the
// leading ft.com sets its body copy at.
Wordpress2016.baseLineHeight = 1.62;
Wordpress2016.bodyWeight = 400;
Wordpress2016.boldWeight = 700;
Wordpress2016.bodyColor = ink;
const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale

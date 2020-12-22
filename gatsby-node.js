/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  const fileNode = getNode(node.parent)

  if (node.internal.type === `Yaml` && fileNode.base === "index.yaml") {
    const url = createFilePath({ node, getNode })

    const templates = ["BlogPost"]
    const layout = templates.filter(template =>
      Object.keys(node).includes(template)
    )[0]

    if (!layout) return

    createNodeField({
      node,
      name: `url`,
      value: url,
    })

    createNodeField({
      node,
      name: `layout`,
      value: layout,
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const { data } = await graphql(`
    {
      allYaml {
        edges {
          node {
            fields {
              url
              layout
            }
          }
        }
      }
    }
  `)

  data.allYaml.edges.forEach(({ node }) => {
    if (!node.fields) return

    createPage({
      path: node.fields.url,
      component: path.resolve(`src/templates/${node.fields.layout}.js`),
      context: {
        url: node.fields.url,
      },
    })
  })
}

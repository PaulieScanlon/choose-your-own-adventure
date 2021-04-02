module.exports = {
  flags: {
    // https://stackoverflow.com/a/65980746/6600216
    DEV_SSR: false
  },
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: `http://wp-demo.online/graphql` // 👋
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`
  ]
};

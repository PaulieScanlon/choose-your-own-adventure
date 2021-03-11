# wp-demo

This is a [gatsby-source-wordpress](https://www.gatsbyjs.com/plugins/gatsby-source-wordpress/?=gatsby%20source%20wordpress) demo designed to work with [http://wp-demo.online](http://wp-demo.online/)

Link to video: [TBC]()

## Pre Getting Started - WordPress

1. Install WP GraphQL in Wordpress
2. Install WP Gatsby in Wordpress

By installing the above two plugins in the demo WordPress site it now exposes a
this graphql end point: [http://wp-demo.online/graphql](http://wp-demo.online/graphql)

## Getting Started - Gatsby

Clone the repo

```sh
git clone https://github.com/PaulieScanlon/wp-demo.git

```

## Development

### Step 1

1.1 Install dependencies. You can use `npm install` too, I just prefer `yarn`

```sh
yarn add gatsby react react-dom

```

1.2 Install plugins

```sh
yarn add gatsby-source-wordpress gatsby-transformer-sharp gatsby-plugin-sharp

```

1.3 Add plugins to the plugins array in `gatsby-config.js` and the [/graphql](/graphql) endpoint to `gatsby-source-wordpress` options

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: 'http://wp-demo.online/graphql'
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`
  ]
};
```

1.4. Add "scripts" to `package.json`

```javascript
// package.json

"scripts": {
  "develop": "gatsby develop",
  "build": "gatsby build",
  "clean": "gatsby clean",
  "serve": "gatsby serve",
},
```

1.5 Run the development server

```sh
yarn develop
```

**Result**

At this point the Gatsby dev sever should start up with no errors and by visiting `http://localhost:8000/` and then clicking the "Preview custom 404 page" button you should be seeing a blank page that says "Page Not Found"

-- end of Step 1

### Step 2

2.1 With the dev server running visit `http://localhost:8000/__graphql` and enter the below query in GraphiQL

```sh
{
  allWpPage {
    edges {
      node {
        id
        uri
      }
    }
  }
}
```

_You should be seeing the `allWpPage.edges` array containing a `node` with an `id` and `uri` for each page_

2.2 Add GraphQL to `gatsby-node`

```javascript
// gatsby-node.js

exports.createPages = async ({ graphql }) => {
  const {
    data: { allWpPage }
  } = await graphql(`
    query {
      allWpPage {
        edges {
          node {
            id
            uri
          }
        }
      }
    }
  `);

  console.log(JSON.stringify(allWpPage, null, 2));
};
```

_You may need to re-start the dev server. The console log will appear in the **terminal** not in the **browser**_

2.3 Create a Page Template

_This template will be used in the next step by `actions.createPage`_

```sh
|-- src
  |-- templates
    |-- wp-page-template.js
```

Don't worry about the class names yet, all will become clear soon enough!

```javascript
// src/templates/wp-page-template.js

import React from 'react';
import { graphql } from 'gatsby';

const WpPageTemplate = ({ data }) => {
  const { title, content } = data.wpPage;

  return (
    <div id="page" className="site">
      <div id="content" className="site-content">
        <div id="content" className="content-area">
          <main id="main" className="site-main" role="main">
            <article>
              <header className="entry-header alignwide">
                <h1 className="entry-title">{title}</h1>
              </header>

              <div
                className="entry-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export const query = graphql`
  query($id: String!) {
    wpPage(id: { eq: $id }) {
      title
      content
    }
  }
`;

export default WpPageTemplate;
```

2.4 Create pages sourced from WordPress and use the `wp-page-template`

```diff
// gatsby-node.js

- exports.createPages = async ({ graphql }) => {
+ exports.createPages = async ({ graphql, actions }) => {
  const { data: { allWpPage } } = await graphql(`
    query {
      allWpPage {
        edges {
          node {
            id
            uri
          }
        }
      }
    }
  `);

-  console.log(JSON.stringify(data, null, 2));

+  allWpPage.edges.map((page) => {
+    const { id, uri } = page.node;

+    return actions.createPage({
+      path: uri,
+      component: require.resolve('./src/templates/wp-page-template.js'),
+      context: {
+        id: id
+      }
+    });
+  });

};
```

**Result**

You may need to restart your dev server. If you now visit `http://localhost:8000/` you should be seeing the "Home" page with a `title`, `id` and `content`. You can also manually visit `http://localhost:8000/about` or `http://localhost:8000/another`

One point to note here is we're not creating our own pages in `src/pages` because we're sourcing existing pages that have been created in the WordPress demo site.

The only "page" in the repo is the Not Found Page / `404.js`

-- end of Step 2

## Step 3

3.1 With the dev server running visit `http://localhost:8000/__graphql` and enter the below query in GraphiQL

```sh
{
  wpMenu {
    menuItems {
      nodes {
        label
        url
      }
    }
  }
}
```

_You should be seeing the `wpMenu.menuItems.nodes` array containing a `label` and `url` for each page_

3.2 Create the navigation component

```sh
|-- src
  |-- components
    |-- navigation.js
```

```javascript
// src/components/navigation.js

import { graphql, useStaticQuery, Link } from 'gatsby';
import React from 'react';

const Navigation = () => {
  const { wpMenu } = useStaticQuery(graphql`
    query {
      wpMenu {
        menuItems {
          nodes {
            id
            label
            url
          }
        }
      }
    }
  `);

  return (
    <header id="masthead" className="site-header has-menu">
      <nav
        id="site-navigation"
        className="primary-navigation"
        role="navigation"
        aria-label="Primary menu"
      >
        <div className="primary-menu-container">
          <ul className="primary-menu-list menu-wrapper">
            {wpMenu.menuItems.nodes.map((item) => {
              const { id, label, url } = item;
              return (
                <li key={id} className="menu-item">
                  <Link to={url}>{label}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
```

3.2 Add navigation to `wp-page-template.js`

```diff
import React from 'react';
import { graphql } from 'gatsby';
+ import Navigation from '../components/navigation';

const WpPageTemplate = ({ data }) => {
  const { title, content } = data.wpPage;

  return (
    <div id="page" className="site">
+      <Navigation />
      <div id="content" className="site-content">
        <div id="content" className="content-area">
          <main id="main" className="site-main" role="main">
            <article>
              <header className="entry-header alignwide">
                <h1 className="entry-title">{title}</h1>
              </header>

              <div
                className="entry-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export const query = graphql`
  query($id: String!) {
    wpPage(id: { eq: $id }) {
      title
      content
    }
  }
`;

export default WpPageTemplate;
```

**Result**

You should now have a navigation at the top of each page, clicking the links will take you to each of the pages.

-- end of Step 3

## Step 4

You may have wondered why some of the HTML tags we've used had class names. This is for when we "borrow" the CSS from the WordPress [twentytwentyone](https://github.com/WordPress/twentytwentyone) theme everything gets styled correctly.

4.1 CSS

Create a new dir and file

```sh
|-- src
  |-- styles
    |-- styles.css
```

4.1 As a final step visit this link: [styles.css](https://raw.githubusercontent.com/WordPress/twentytwentyone/trunk/style.css) and copy the CSS and paste it into `src/styles/styles.css`

4.2 Import the CSS into `gatsby-browser.js`

```javascript
// gatsby-browser.js

import './src/styles/styles.css';
```

If you're see not seeing any changes to the styles try restarting the dev server.

**Result**

You should now have a Gatsby site that looks very similar to the [wp-demo.online](http://wp-demo.online/) site

-- end of Step 4 and finished

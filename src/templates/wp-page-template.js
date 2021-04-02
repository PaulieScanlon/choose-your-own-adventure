import React from 'react';
import { graphql } from 'gatsby';

const WpPageTemplate = ({ data: { wpPage } }) => {
  const { title, content } = wpPage;

  return (
    <section>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </section>
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

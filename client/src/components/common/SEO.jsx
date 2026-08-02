import { Helmet } from "react-helmet-async";

const SEO = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | MehzHaya` : "MehzHaya | Timeless Hijabs for the Modern You"}</title>
    <meta
      name="description"
      content={
        description ||
        "MehzHaya - Premium Hijabs, Niqabs, Abayas & Islamic Fashion. Timeless Hijabs for the Modern You."
      }
    />
  </Helmet>
);

export default SEO;

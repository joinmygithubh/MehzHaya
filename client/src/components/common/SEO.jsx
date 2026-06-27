import { Helmet } from "react-helmet-async";

const SEO = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | MehzHaya` : "MehzHaya | Elegance in Every Fold"}</title>
    <meta
      name="description"
      content={
        description ||
        "MehzHaya - Premium Hijabs, Niqabs, Abayas & Islamic Fashion. Elegance in Every Fold."
      }
    />
  </Helmet>
);

export default SEO;

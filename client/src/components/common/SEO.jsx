import { Helmet } from "react-helmet-async";

const SEO = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | MehzHaya` : "MehzHaya | Elegance in Modesty"}</title>
    <meta
      name="description"
      content={
        description ||
        "MehzHaya - Premium Hijabs, Niqabs, Abayas & Islamic Fashion. Elegance in Modesty."
      }
    />
  </Helmet>
);

export default SEO;

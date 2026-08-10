import { Helmet } from "react-helmet-async";

const SEO = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | MehzHaya` : "MehzHaya | Timeless Abaya and Hijab for Modern Muslimah"}</title>
    <meta
      name="description"
      content={
        description ||
        "MehzHaya - Premium Hijabs, Niqabs, Abayas & Islamic Fashion. Timeless Abaya and Hijab for Modern Muslimah."
      }
    />
  </Helmet>
);

export default SEO;

import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";
import WhatsAppButton from "../common/WhatsAppButton";

const MainLayout = ({ minimal = false }) => {
  return (
    <div className="flex min-h-screen flex-col">
      {!minimal && <AnnouncementBar />}
      <Header minimal={minimal} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!minimal && <Footer />}
      {!minimal && <WhatsAppButton />}
    </div>
  );
};

export default MainLayout;

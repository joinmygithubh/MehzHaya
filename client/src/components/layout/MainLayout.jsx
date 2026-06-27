import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";

const MainLayout = ({ minimal = false }) => {
  return (
    <div className="flex min-h-screen flex-col">
      {!minimal && <AnnouncementBar />}
      <Header minimal={minimal} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!minimal && <Footer />}
    </div>
  );
};

export default MainLayout;

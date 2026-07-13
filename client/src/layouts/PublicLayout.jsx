import { Outlet } from "react-router";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function PublicLayout() {
    return (
        <div className="site-wrapper">
            <Navbar />

            <div className="site-content">
                <Outlet />
            </div>

            <Footer />
        </div>
    );
}

export default PublicLayout;
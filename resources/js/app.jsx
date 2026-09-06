import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/public/LandingPage.jsx";
import FAQ from "./pages/public/FAQ.jsx";
import LogIn from "./pages/auth/LogIn.jsx";
import Signup from "./pages/auth/Signup.jsx";
import LoginOtp from "./pages/auth/LoginOtp.jsx";
import SignupVerify from "./pages/auth/SignupVerify.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import SystemUser from "./pages/customer/SystemUser.jsx";
import SuperAdmin from "./pages/super-admin/SuperAdmin.jsx";
import WebsiteContentAdmin from "./pages/super-admin/WebsiteContentAdmin.jsx";
import OperationsManager from "./pages/operations/OperationsManager.jsx";
import PurchasingManager from "./pages/purchasing/PurchasingManager.jsx";
import PurchasingStaff from "./pages/purchasing/PurchasingStaff.jsx";
import WarehouseAdmin from "./pages/warehouse/WarehouseAdmin.jsx";
import InventoryController from "./pages/inventory/InventoryController.jsx";
import SalesManager from "./pages/sales/SalesManager.jsx";
import SalesStaff from "./pages/sales/SalesStaff.jsx";
import UserAdmin from "./pages/user-admin/UserAdmin.jsx";
import RolePreview from "./pages/super-admin/RolePreview.jsx";

import PresenceTracker from "./components/shared/session/PresenceTracker.jsx";

import "../css/auth/transitions.css";

/* =========================================================
   AUTH PAGE ORDER

   Home   = 0
   Login  = 1
   Signup = 2
   ========================================================= */

const AUTH_PAGE_ORDER = {
    "/": 0,
    "/login": 1,
    "/signup": 2,
};

/* =========================================================
   PAGES THAT WILL USE SLIDE ANIMATION
   ========================================================= */

const AUTH_TRANSITION_PATHS = new Set(["/", "/login", "/signup"]);

/* =========================================================
   ANIMATED ROUTES
   ========================================================= */

function AnimatedRoutes() {
    const location = useLocation();

    // Page currently visible
    const [displayLocation, setDisplayLocation] = useState(location);

    // Page we are going to
    const pendingLocation = useRef(null);

    // idle | exit | enter
    const [phase, setPhase] = useState("idle");

    // forward | backward
    const [direction, setDirection] = useState("forward");

    /* =====================================================
       DETECT PAGE CHANGE
       ===================================================== */

    useEffect(() => {
        const currentPath = displayLocation.pathname;

        const nextPath = location.pathname;

        // Same page
        if (
            currentPath === nextPath &&
            displayLocation.search === location.search
        ) {
            return;
        }

        // Only animate:
        // Home
        // Login
        // Signup

        const shouldAnimate =
            AUTH_TRANSITION_PATHS.has(currentPath) &&
            AUTH_TRANSITION_PATHS.has(nextPath);

        // OTP and dashboard pages change normally
        if (!shouldAnimate) {
            pendingLocation.current = null;

            setDisplayLocation(location);

            setPhase("idle");

            return;
        }

        // Save next page
        pendingLocation.current = location;

        const currentOrder = AUTH_PAGE_ORDER[currentPath] ?? 0;

        const nextOrder = AUTH_PAGE_ORDER[nextPath] ?? 0;

        // Going deeper:
        // Home -> Login
        // Login -> Signup

        if (nextOrder > currentOrder) {
            setDirection("forward");
        }

        // Going back:
        // Signup -> Login
        // Login -> Home
        else {
            setDirection("backward");
        }

        // Start old page exit animation
        setPhase("exit");
    }, [location, displayLocation]);

    /* =====================================================
       WHEN ANIMATION FINISHES
       ===================================================== */

    const handleAnimationEnd = (event) => {
        // Ignore animations from elements inside the page
        if (event.target !== event.currentTarget) {
            return;
        }

        // OLD PAGE FINISHED LEAVING
        if (phase === "exit" && pendingLocation.current) {
            setDisplayLocation(pendingLocation.current);

            setPhase("enter");

            return;
        }

        // NEW PAGE FINISHED ENTERING
        if (phase === "enter") {
            pendingLocation.current = null;

            setPhase("idle");
        }
    };

    /* =====================================================
       BUILD ANIMATION CLASS
       ===================================================== */

    let transitionClass = "auth-transition-page";

    // Old page leaves
    if (phase === "exit") {
        transitionClass +=
            direction === "forward" ? " exit-forward" : " exit-backward";
    }

    // New page enters
    if (phase === "enter") {
        transitionClass +=
            direction === "forward" ? " enter-forward" : " enter-backward";
    }

    /* =====================================================
       ROUTES
       ===================================================== */

    return (
        <div className="auth-transition-root">
            <div
                className={transitionClass}
                onAnimationEnd={handleAnimationEnd}
            >
                <Routes location={displayLocation}>
                    {/* =====================================
                        PUBLIC PAGES
                        ===================================== */}

                    <Route path="/" element={<LandingPage />} />
                    <Route path="/faq" element={<FAQ />} />

                    <Route path="/login" element={<LogIn />} />

                    <Route path="/signup" element={<Signup />} />

                    {/* =====================================
                        OTP PAGES
                        ===================================== */}

                    <Route path="/login-otp" element={<LoginOtp />} />

                    <Route path="/signup-verify" element={<SignupVerify />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* =====================================
                        SYSTEM USER
                        ===================================== */}

                    <Route path="/user" element={<SystemUser />} />
                    {/* STAFF ROLE DASHBOARDS */}
                    <Route path="/operations-manager" element={<OperationsManager />} />
                    <Route path="/purchasing-manager" element={<PurchasingManager />} />
                    <Route path="/purchasing-staff" element={<PurchasingStaff />} />
                    <Route path="/warehouse-admin" element={<WarehouseAdmin />} />
                    <Route path="/inventory-controller" element={<InventoryController />} />
                    <Route path="/sales-manager" element={<SalesManager />} />
                    <Route path="/sales-staff" element={<SalesStaff />} />
                    <Route path="/user-admin" element={<UserAdmin />} />

                    {/* =====================================
                        SUPER ADMIN
                        ===================================== */}

                    <Route path="/super-admin" element={<SuperAdmin />} />
                    <Route path="/super-admin/role-preview/:roleKey" element={<RolePreview />} />
                    <Route path="/super-admin/content" element={<WebsiteContentAdmin />} />
                    <Route path="/store-preview" element={<SystemUser previewMode />} />
                </Routes>
            </div>
        </div>
    );
}

/* =========================================================
   MAIN APP
   ========================================================= */

function App() {
    return (
        <>
            <PresenceTracker />

            <AnimatedRoutes />
        </>
    );
}

/* =========================================================
   START REACT
   ========================================================= */

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);

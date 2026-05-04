import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import App from "./App";
import AdminReview from "./pages/AdminReview";
import { adminInvoke, getStoredAdminKey } from "./lib/adminApi";

function AdminReviewGuard() {
  const location = useLocation();
  const [guardStatus, setGuardStatus] = useState(() =>
    getStoredAdminKey() ? "checking" : "no-key",
  );
  const [guardMessage, setGuardMessage] = useState("");

  useEffect(() => {
    if (!getStoredAdminKey()) return;

    let alive = true;

    (async () => {
      try {
        if (alive) setGuardStatus("checking");
        await adminInvoke("admin-auth", { method: "GET" });
        if (!alive) return;
        setGuardStatus("allowed");
        setGuardMessage("");
      } catch (e) {
        if (!alive) return;
        setGuardStatus("denied");
        setGuardMessage(e?.message || "Access denied");
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  return <AdminReview guardStatus={guardStatus} guardMessage={guardMessage} />;
}

function RouterSetup() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin/review" element={<AdminReviewGuard />} />
    </Routes>
  );
}

export default RouterSetup;

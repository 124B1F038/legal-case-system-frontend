import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getNotifications, deleteNotification, clearAllNotifications } from "../api";

const ICON_MAP = {
  "📅": { bg: "#dbeafe", border: "#93c5fd" },
  "⚖️": { bg: "#dcfce7", border: "#86efac" },
  "🗓️": { bg: "#fef3c7", border: "#fcd34d" },
  "📄": { bg: "#f3e8ff", border: "#d8b4fe" },
  default: { bg: "#f1f5f9", border: "#cbd5e1" },
};

function getCardStyle(msg) {
  const emoji = ["📅", "⚖️", "🗓️", "📄"].find(e => msg.startsWith(e));
  return ICON_MAP[emoji] || ICON_MAP.default;
}

function timeSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const userId = (() => {
    // Try to get numeric user_id from localStorage (set during login if stored)
    // Fallback: fetch all for admin, or use stored value
    return localStorage.getItem("userId") || null;
  })();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getNotifications(userId);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const dismiss = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
    } catch (err) {
      console.error("Failed to dismiss:", err);
    }
  };

  const clearAll = async () => {
    try {
      await clearAllNotifications(userId);
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear:", err);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            Notifications
            {notifications.length > 0 && (
              <span style={{
                marginLeft: "12px",
                fontSize: "0.85rem",
                background: "#e2e8f0",
                color: "#475569",
                padding: "2px 10px",
                borderRadius: "20px",
                fontWeight: 600,
              }}>{notifications.length}</span>
            )}
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: "8px 16px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#94a3b8",
            border: "1px dashed #e2e8f0",
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔔</div>
            <p style={{ margin: 0, fontSize: "1rem" }}>No notifications yet.</p>
            <p style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>Events like hearing schedules and case closures will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map(n => {
              const style = getCardStyle(n.message);
              return (
                <div
                  key={n.notification_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "14px 18px",
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: "10px",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "#0f172a", fontSize: "0.95rem", lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                      {timeSince(n.created_at)}
                    </span>
                  </div>
                  <button
                    onClick={() => dismiss(n.notification_id)}
                    title="Dismiss"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      fontSize: "1.1rem",
                      padding: "2px 6px",
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notifications;
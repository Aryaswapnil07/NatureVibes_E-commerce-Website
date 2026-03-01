import { useState, useEffect, useRef } from "react";

const Navbar = ({ onMenuClick, onLogout, userName = "Admin User" }) => {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const timer = setInterval(() => setTime(new Date()), 60000);

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { label: "Dashboard", icon: "grid_view", href: "#" },
    { label: "Analytics", icon: "bar_chart", href: "#" },
    { label: "Reports", icon: "description", href: "#" },
    { label: "Settings", icon: "settings", href: "#" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        :root {
          --green-900: #1b5e20;
          --green-700: #2e7d32;
          --green-500: #4caf50;
          --green-100: #e8f5e9;
          --green-50: #f1f8f2;
          --accent: #00c853;
          --surface: rgba(255,255,255,0.97);
          --border: rgba(46,125,50,0.12);
          --text-primary: #1a2e1c;
          --text-secondary: #5a7060;
          --shadow-nav: 0 1px 0 rgba(46,125,50,0.08), 0 8px 32px rgba(27,94,32,0.06);
          --shadow-nav-scrolled: 0 1px 0 rgba(46,125,50,0.10), 0 12px 40px rgba(27,94,32,0.12);
          --radius-pill: 999px;
          --radius-lg: 16px;
          --radius-md: 10px;
        }

        .nb-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .nb-root { font-family: 'DM Sans', sans-serif; }

        /* ── HEADER ── */
        .nb-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-nav);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        .nb-header.scrolled {
          box-shadow: var(--shadow-nav-scrolled);
          background: rgba(255,255,255,0.99);
        }

        .nb-inner {
          display: flex;
          align-items: center;
          height: 68px;
          padding: 0 28px;
          gap: 12px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* ── BRAND ── */
        .nb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nb-brand-mark {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--green-700) 0%, var(--green-500) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(46,125,50,0.25);
          flex-shrink: 0;
        }
        .nb-brand-mark span {
          color: white;
          font-size: 1.1rem;
        }
        .nb-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .nb-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--green-900);
          letter-spacing: -0.3px;
        }
        .nb-brand-sub {
          font-size: 0.68rem;
          color: var(--text-secondary);
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        /* ── DIVIDER ── */
        .nb-divider {
          width: 1px;
          height: 28px;
          background: var(--border);
          flex-shrink: 0;
        }

        /* ── PAGE LABEL ── */
        .nb-page-label {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .nb-page-label-top {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .nb-page-label-main {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        /* ── SPACER ── */
        .nb-spacer { flex: 1; }

        /* ── DESKTOP NAV ── */
        .nb-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
        }
        .nb-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: var(--radius-pill);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .nb-nav-link span.material-icons {
          font-size: 0.95rem;
          transition: transform 0.2s ease;
        }
        .nb-nav-link:hover {
          color: var(--green-700);
          background: var(--green-50);
          border-color: var(--border);
        }
        .nb-nav-link:hover span.material-icons { transform: translateY(-1px); }
        .nb-nav-link.active {
          color: var(--green-700);
          background: var(--green-100);
          border-color: rgba(46,125,50,0.18);
          font-weight: 600;
        }

        /* ── CLOCK ── */
        .nb-clock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .nb-clock-time {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .nb-clock-date {
          font-size: 0.68rem;
          color: var(--text-secondary);
          letter-spacing: 0.2px;
        }

        /* ── STATUS DOT ── */
        .nb-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-pill);
          flex-shrink: 0;
        }
        .nb-status-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
        .nb-status-text {
          font-size: 0.72rem;
          color: #166534;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* ── PROFILE ── */
        .nb-profile-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .nb-profile-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 12px 6px 6px;
          background: var(--green-50);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .nb-profile-btn:hover {
          background: var(--green-100);
          border-color: rgba(46,125,50,0.25);
          box-shadow: 0 4px 12px rgba(46,125,50,0.1);
        }
        .nb-avatar {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, var(--green-700), var(--green-500));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: white;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .nb-profile-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .nb-profile-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .nb-profile-role {
          font-size: 0.66rem;
          color: var(--text-secondary);
        }
        .nb-profile-caret {
          font-size: 0.9rem !important;
          color: var(--text-secondary);
          transition: transform 0.25s ease;
        }
        .nb-profile-caret.open { transform: rotate(180deg); }

        /* ── DROPDOWN ── */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 230px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 50px rgba(27,94,32,0.14), 0 0 0 1px rgba(46,125,50,0.05);
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px) scale(0.97);
          transform-origin: top right;
          transition: all 0.22s cubic-bezier(0.165,0.84,0.44,1);
          z-index: 1100;
        }
        .nb-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        .nb-dropdown-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid var(--green-100);
          background: var(--green-50);
        }
        .nb-dropdown-header-name {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .nb-dropdown-header-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .nb-dropdown-body { padding: 6px; }
        .nb-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.84rem;
          color: #2f4233;
          transition: background 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }
        .nb-dropdown-item span.material-icons { font-size: 1rem; color: var(--text-secondary); }
        .nb-dropdown-item:hover { background: var(--green-50); color: var(--green-700); }
        .nb-dropdown-item:hover span.material-icons { color: var(--green-700); }
        .nb-dropdown-item.danger { color: #991b1b; }
        .nb-dropdown-item.danger span.material-icons { color: #dc2626; }
        .nb-dropdown-item.danger:hover { background: #fff1f2; }
        .nb-dropdown-sep { height: 1px; background: var(--green-100); margin: 4px 6px; }

        /* ── NOTIFICATIONS ── */
        .nb-notif-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--green-50);
          border: 1px solid var(--border);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .nb-notif-btn span.material-icons { font-size: 1.1rem; color: var(--text-secondary); }
        .nb-notif-btn:hover { background: var(--green-100); border-color: rgba(46,125,50,0.25); }
        .nb-notif-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        /* ── HAMBURGER ── */
        .nb-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
          background: var(--green-50);
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nb-hamburger:hover { background: var(--green-100); }
        .nb-bar {
          width: 20px;
          height: 2px;
          background: var(--green-700);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.165,0.84,0.44,1);
          transform-origin: center;
        }
        .nb-hamburger.open .nb-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nb-hamburger.open .nb-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-hamburger.open .nb-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── MOBILE PANEL ── */
        .nb-mobile-panel {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid var(--border);
          box-shadow: 0 20px 50px rgba(27,94,32,0.12);
          z-index: 999;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.165,0.84,0.44,1);
        }
        .nb-mobile-panel.open { max-height: 70vh; overflow-y: auto; }
        .nb-mobile-inner {
          padding: 12px 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nb-mobile-section-label {
          font-size: 0.67rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--text-secondary);
          font-weight: 600;
          padding: 8px 12px 4px;
        }
        .nb-mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.18s;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .nb-mobile-link span.material-icons { font-size: 1.1rem; color: var(--text-secondary); }
        .nb-mobile-link:hover, .nb-mobile-link.active {
          background: var(--green-50);
          color: var(--green-700);
        }
        .nb-mobile-link:hover span.material-icons,
        .nb-mobile-link.active span.material-icons { color: var(--green-700); }
        .nb-mobile-sep { height: 1px; background: var(--green-100); margin: 8px 0; }
        .nb-mobile-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--green-50);
          border-radius: 14px;
          margin-bottom: 4px;
          border: 1px solid var(--border);
        }
        .nb-mobile-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--green-700), var(--green-500));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }
        .nb-mobile-user-info { flex: 1; }
        .nb-mobile-user-name {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-primary);
        }
        .nb-mobile-user-role {
          font-size: 0.73rem;
          color: var(--text-secondary);
        }
        .nb-mobile-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          color: #991b1b;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .nb-mobile-logout span.material-icons { font-size: 1.1rem; color: #dc2626; }
        .nb-mobile-logout:hover { background: #fff1f2; }

        /* ── BACKDROP ── */
        .nb-backdrop {
          position: fixed;
          inset: 0;
          top: 68px;
          background: rgba(10,25,12,0.3);
          backdrop-filter: blur(2px);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .nb-backdrop.active { opacity: 1; pointer-events: auto; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .nb-clock { display: none; }
          .nb-nav { gap: 1px; }
        }
        @media (max-width: 900px) {
          .nb-nav { display: none; }
          .nb-hamburger { display: flex; }
          .nb-status { display: none; }
          .nb-profile-info { display: none; }
          .nb-profile-caret { display: none; }
          .nb-profile-btn {
            padding: 5px;
            background: none;
            border: 1px solid var(--border);
          }
          .nb-avatar { width: 32px; height: 32px; }
        }
        @media (max-width: 600px) {
          .nb-inner { padding: 0 16px; height: 60px; }
          .nb-mobile-panel { top: 60px; }
          .nb-backdrop { top: 60px; }
          .nb-brand-text { display: none; }
          .nb-page-label { display: none; }
          .nb-divider { display: none; }
          .nb-notif-btn { width: 34px; height: 34px; }
          .nb-profile-btn { background: none; border-color: transparent; }
        }
        @media (max-width: 400px) {
          .nb-inner { gap: 8px; padding: 0 12px; }
        }
      `}</style>

      <div className="nb-root">
        <header className={`nb-header${scrolled ? " scrolled" : ""}`}>
          <div className="nb-inner">

            {/* Brand */}
            <a href="#" className="nb-brand">
              <div className="nb-brand-mark">
                <span className="material-icons" style={{ color: "white", fontSize: "1.1rem" }}>
                  eco
                </span>
              </div>
              <div className="nb-brand-text">
                <span className="nb-brand-name">GreenAdmin</span>
                <span className="nb-brand-sub">Control Panel</span>
              </div>
            </a>

            <div className="nb-divider" />

            {/* Page Label */}
            <div className="nb-page-label">
              <span className="nb-page-label-top">Current view</span>
              <span className="nb-page-label-main">Dashboard</span>
            </div>

            <div className="nb-spacer" />

            {/* Desktop Nav */}
            <ul className="nb-nav">
              {navItems.map((item, i) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`nb-nav-link${i === 0 ? " active" : ""}`}
                  >
                    <span className="material-icons">{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Clock */}
            <div className="nb-clock">
              <span className="nb-clock-time">{formattedTime}</span>
              <span className="nb-clock-date">{formattedDate}</span>
            </div>

            {/* Status */}
            <div className="nb-status">
              <div className="nb-status-dot" />
              <span className="nb-status-text">Online</span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="nb-notif-btn"
              aria-label="Notifications"
            >
              <span className="material-icons">notifications</span>
              <span className="nb-notif-badge" />
            </button>

            {/* Profile Dropdown */}
            <div className="nb-profile-wrap" ref={dropdownRef}>
              <button
                type="button"
                className="nb-profile-btn"
                onClick={() => setProfileOpen((o) => !o)}
                aria-expanded={profileOpen}
              >
                <div className="nb-avatar">{initials}</div>
                <div className="nb-profile-info">
                  <span className="nb-profile-name">{userName}</span>
                  <span className="nb-profile-role">Administrator</span>
                </div>
                <span className={`material-icons nb-profile-caret${profileOpen ? " open" : ""}`}>
                  expand_more
                </span>
              </button>

              <div className={`nb-dropdown${profileOpen ? " open" : ""}`}>
                <div className="nb-dropdown-header">
                  <div className="nb-dropdown-header-name">{userName}</div>
                  <div className="nb-dropdown-header-email">admin@greenadmin.io</div>
                </div>
                <div className="nb-dropdown-body">
                  {[
                    { icon: "person_outline", label: "My Profile" },
                    { icon: "manage_accounts", label: "Account Settings" },
                    { icon: "support_agent", label: "Help & Support" },
                  ].map((item) => (
                    <button key={item.label} type="button" className="nb-dropdown-item">
                      <span className="material-icons">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="nb-dropdown-sep" />
                  <button
                    type="button"
                    className="nb-dropdown-item danger"
                    onClick={() => { setProfileOpen(false); onLogout?.(); }}
                  >
                    <span className="material-icons">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Hamburger */}
            <button
              type="button"
              className={`nb-hamburger${mobileMenuOpen ? " open" : ""}`}
              onClick={() => { setMobileMenuOpen((o) => !o); onMenuClick?.(); }}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="nb-bar" />
              <div className="nb-bar" />
              <div className="nb-bar" />
            </button>
          </div>
        </header>

        {/* Mobile Panel */}
        <div className={`nb-mobile-panel${mobileMenuOpen ? " open" : ""}`} role="navigation">
          <div className="nb-mobile-inner">
            <div className="nb-mobile-user">
              <div className="nb-mobile-avatar">{initials}</div>
              <div className="nb-mobile-user-info">
                <div className="nb-mobile-user-name">{userName}</div>
                <div className="nb-mobile-user-role">Administrator · Online</div>
              </div>
            </div>

            <span className="nb-mobile-section-label">Navigation</span>

            {navItems.map((item, i) => (
              <button
                key={item.label}
                type="button"
                className={`nb-mobile-link${i === 0 ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="nb-mobile-sep" />
            <span className="nb-mobile-section-label">Account</span>

            {[
              { icon: "person_outline", label: "My Profile" },
              { icon: "notifications_none", label: "Notifications" },
              { icon: "manage_accounts", label: "Settings" },
            ].map((item) => (
              <button key={item.label} type="button" className="nb-mobile-link">
                <span className="material-icons">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="nb-mobile-sep" />

            <button
              type="button"
              className="nb-mobile-logout"
              onClick={() => { setMobileMenuOpen(false); onLogout?.(); }}
            >
              <span className="material-icons">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        {/* Backdrop */}
        <div
          className={`nb-backdrop${mobileMenuOpen ? " active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default Navbar;
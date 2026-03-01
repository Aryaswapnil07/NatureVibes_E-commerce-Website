import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiHome, FiInfo, FiLayers, FiChevronRight } from "react-icons/fi";
import SearchBar from "./SearchBar";
import "./css/navbar.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_COLLAPSE_WIDTH = 1100;

const SEARCH_SUGGESTIONS = [
  'Search "Snake Plant"',
  'Search "Tomato Seeds"',
  'Search "Ceramic Pot"',
  'Search "Fertilizer"',
  'Search "Office Chair"',
];

const CATALOG_SECTIONS = [
  {
    id: "cat-indoor",
    icon: "home",
    label: "Indoor",
    links: [
      { name: "Snake Plants" },
      { name: "Air Purifiers" },
    ],
  },
  {
    id: "cat-foliage",
    icon: "eco",
    label: "Foliage",
    links: [
      { name: "Money Plants" },
      { name: "Monstera" },
    ],
  },
  {
    id: "cat-outdoor",
    icon: "wb_sunny",
    label: "Outdoor",
    links: [
      { name: "Flowering" },
      { name: "Fruit Plants" },
    ],
  },
  {
    id: "cat-pots",
    icon: "build",
    label: "Essentials",
    links: [
      { name: "Pots" },
      { name: "Tools" },
    ],
    isLast: true,
  },
];

const FURNITURE_SECTIONS = [
  {
    id: "furniture",
    initial: "S",
    icon: "chair",
    label: "Living Room",
    links: [{ name: "Sofas" }, { name: "Coffee Tables" }],
  },
  {
    id: "furniture",
    initial: "B",
    icon: "bed",
    label: "Bedroom",
    links: [{ name: "Beds" }, { name: "Wardrobes" }],
  },
];

const ACCOUNT_ROUTES = [
  { label: "My Profile",     path: "/account/profile",        icon: "person_outline"   },
  { label: "Current Orders", path: "/account/orders/current", icon: "local_shipping"   },
  { label: "Order History",  path: "/account/orders/history", icon: "receipt_long"     },
  { label: "Address Book",   path: "/account/addresses",      icon: "location_on"      },
];

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

function useRotatingPlaceholder(suggestions, intervalMs = 2500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % suggestions.length), intervalMs);
    return () => clearInterval(id);
  }, [suggestions, intervalMs]);
  return suggestions[index];
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// ─── Desktop Mega Menu ────────────────────────────────────────────────────────

const DesktopCatalogMenu = ({ onNavigate }) => (
  <div className="mega-menu-container">
    <div className="modern-mega-grid">
      {CATALOG_SECTIONS.map(({ id, icon, label, links, isLast }) => (
        <div
          key={id + label}
          className="mega-links-section"
          style={isLast ? { borderRight: "none" } : undefined}
        >
          <div className="mega-cat-header">
            <span className="material-icons" style={{ color: "var(--green)" }}>{icon}</span>
            <h4>{label}</h4>
          </div>
          <ul className="mega-link-list">
            {links.map(({ name }) => (
              <li key={name}>
                <a href={`#${id}`} onClick={(e) => onNavigate(e, `#${id}`)}>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const DesktopFurnitureMenu = ({ onNavigate }) => (
  <div className="mega-menu-container">
    <div className="mega-grid legacy-grid">
      {FURNITURE_SECTIONS.map(({ id, initial, label, links }) => (
        <div key={label} className="nav-card furniture-card">
          <div className="card-header">
            <span className="card-icon">{initial}</span>
            <h4>{label}</h4>
          </div>
          <ul>
            {links.map(({ name }) => (
              <li key={name}>
                <a href={`#${id}`} onClick={(e) => onNavigate(e, `#${id}`)}>{name}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ─── Mobile Category Panel ────────────────────────────────────────────────────
// Always visible — no accordion toggle needed

const MobileCatalogPanel = ({ onNavigate }) => (
  <div className="mob-cat-panel">
    <p className="mob-cat-panel__eyebrow">
      <span className="material-icons">eco</span>
      Plants &amp; Catalog
    </p>
    <div className="mob-cat-grid">
      {CATALOG_SECTIONS.map(({ id, icon, label, links }) => (
        <div key={id + label} className="mob-cat-card">
          <div className="mob-cat-card__head">
            <span className="material-icons mob-cat-card__icon">{icon}</span>
            <span className="mob-cat-card__title">{label}</span>
          </div>
          <ul className="mob-cat-card__list">
            {links.map(({ name }) => (
              <li key={name}>
                <a
                  href={`#${id}`}
                  className="mob-cat-card__link"
                  onClick={(e) => onNavigate(e, `#${id}`)}
                >
                  <FiChevronRight size={12} />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const MobileFurniturePanel = ({ onNavigate }) => (
  <div className="mob-cat-panel">
    <p className="mob-cat-panel__eyebrow">
      <span className="material-icons">chair</span>
      Furniture
    </p>
    <div className="mob-cat-grid mob-cat-grid--2col">
      {FURNITURE_SECTIONS.map(({ id, initial, icon, label, links }) => (
        <div key={label} className="mob-cat-card">
          <div className="mob-cat-card__head">
            <span className="mob-cat-card__initial">{initial}</span>
            <span className="mob-cat-card__title">{label}</span>
          </div>
          <ul className="mob-cat-card__list">
            {links.map(({ name }) => (
              <li key={name}>
                <a
                  href={`#${id}`}
                  className="mob-cat-card__link"
                  onClick={(e) => onNavigate(e, `#${id}`)}
                >
                  <FiChevronRight size={12} />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ─── Desktop User Dropdown ────────────────────────────────────────────────────

const UserDropdown = ({ onNavigate, onLogout }) => (
  <div className="user-dropdown-menu">
    {ACCOUNT_ROUTES.map(({ label, path, icon }) => (
      <button key={path} onClick={() => onNavigate(path)}>
        {icon && <span className="material-icons" style={{ fontSize: "1rem", marginRight: 6, color: "#5a7060" }}>{icon}</span>}
        {label}
      </button>
    ))}
    <button className="danger" onClick={onLogout}>
      <span className="material-icons" style={{ fontSize: "1rem", marginRight: 6 }}>logout</span>
      Logout
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Navbar = ({ onOpenLogin, onLogout, isLoggedIn, allProducts }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen,   setIsUserMenuOpen]   = useState(false);

  const userMenuRef       = useRef(null);
  const location          = useLocation();
  const navigate          = useNavigate();
  const searchPlaceholder = useRotatingPlaceholder(SEARCH_SUGGESTIONS);

  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > NAV_COLLAPSE_WIDTH) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const scrollToSection = useCallback((targetId) => {
    const el     = document.querySelector(targetId);
    const header = document.querySelector(".header-main");
    if (!el) return;
    const offset  = Math.round(header?.getBoundingClientRect().height ?? 80);
    const bodyTop = document.body.getBoundingClientRect().top;
    const elTop   = el.getBoundingClientRect().top - bodyTop;
    window.scrollTo({ top: elTop - offset, behavior: "smooth" });
  }, []);

  const handleNavigate = useCallback((e, target) => {
    if (!target.startsWith("#")) return;
    e.preventDefault();
    closeMobileMenu();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(target), 100);
    } else {
      scrollToSection(target);
    }
  }, [location.pathname, navigate, closeMobileMenu, scrollToSection]);

  const handleAuthClick = useCallback(() => {
    if (isLoggedIn) { onLogout?.(); navigate("/"); }
    else             { onOpenLogin?.(); }
  }, [isLoggedIn, onLogout, onOpenLogin, navigate]);

  const navigateToRoute = useCallback((route) => {
    setIsUserMenuOpen(false);
    closeMobileMenu();
    navigate(route);
  }, [navigate, closeMobileMenu]);

  const handleLogout = useCallback(() => {
    setIsUserMenuOpen(false);
    onLogout?.();
    navigate("/");
  }, [onLogout, navigate]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Inline styles for mobile category panels ── */}
      <style>{`
        /* ── Mobile category panel wrapper ── */
        .mob-cat-panel {
          padding: 12px 16px 16px;
          background: #f6fbf6;
          border-top: 1px solid #e5efe6;
        }
        .mob-cat-panel__eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-weight: 700;
          color: #4a7051;
          margin-bottom: 12px;
          font-family: 'Poppins', sans-serif;
        }
        .mob-cat-panel__eyebrow .material-icons {
          font-size: 0.9rem;
          color: var(--green, #2e7d32);
        }

        /* ── Grid of category cards ── */
        .mob-cat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .mob-cat-grid--2col {
          grid-template-columns: 1fr 1fr;
        }

        /* ── Individual category card ── */
        .mob-cat-card {
          background: #fff;
          border: 1px solid #deeade;
          border-radius: 12px;
          padding: 12px 12px 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mob-cat-card:hover {
          border-color: #b2d4b6;
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.08);
        }
        .mob-cat-card__head {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          padding-bottom: 7px;
          border-bottom: 1px solid #edf4ee;
        }
        .mob-cat-card__icon {
          font-size: 1rem !important;
          color: var(--green, #2e7d32);
        }
        .mob-cat-card__initial {
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #2e7d32, #66bb6a);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .mob-cat-card__title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1b3d1f;
          font-family: 'Poppins', sans-serif;
          line-height: 1.2;
        }
        .mob-cat-card__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .mob-cat-card__link {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: #4a6650;
          text-decoration: none;
          padding: 4px 0;
          transition: color 0.15s, gap 0.15s;
          font-family: 'Poppins', sans-serif;
        }
        .mob-cat-card__link:hover {
          color: var(--green, #2e7d32);
          gap: 8px;
        }
        .mob-cat-card__link svg {
          flex-shrink: 0;
          color: #a0bda4;
          transition: color 0.15s;
        }
        .mob-cat-card__link:hover svg {
          color: var(--green, #2e7d32);
        }

        /* ── Mobile section divider ── */
        .mob-section-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 700;
          color: #8aaa8e;
          padding: 12px 20px 4px;
          display: block;
          font-family: 'Poppins', sans-serif;
        }

        /* ── Mobile account rows ── */
        .mob-account-row {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 13px 20px;
          background: none;
          border: none;
          border-bottom: 1px solid #f0f3f0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #2f4233;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .mob-account-row .material-icons {
          font-size: 1.05rem;
          color: #5a7060;
        }
        .mob-account-row:hover {
          background: #f3faf3;
          color: var(--green, #2e7d32);
        }
        .mob-account-row:hover .material-icons {
          color: var(--green, #2e7d32);
        }
        .mob-account-row.danger { color: #8b2f2f; }
        .mob-account-row.danger .material-icons { color: #c0392b; }
        .mob-account-row.danger:hover { background: #fff4f4; }

        /* ── Mobile auth button ── */
        .mob-auth-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 14px 16px 6px;
          padding: 13px;
          background: linear-gradient(135deg, #2e7d32, #43a047);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.2px;
        }
        .mob-auth-cta:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .mob-auth-cta.logout-cta {
          background: #fff;
          color: #8b2f2f;
          border: 1.5px solid #f5c6c6;
        }
        .mob-auth-cta.logout-cta:hover {
          background: #fff4f4;
        }
      `}</style>

      <header className="header-main">

        {/* ── Brand ── */}
        <Link to="/" className="brand-logo" onClick={(e) => handleNavigate(e, "#home")}>
          NatureVibes
        </Link>

        {/* ── Search ── */}
        <div className="blinkit-wrapper">
          <SearchBar placeholder={searchPlaceholder} products={allProducts} />
        </div>

        {/* ── Desktop Nav ── */}
        <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">

            {/* Home */}
            <li className="nav-item">
              <a href="#home" className="nav-link" onClick={(e) => handleNavigate(e, "#home")}>
                <span className="nav-link-stack">
                  <FiHome className="nav-link-icon" />
                  <span className="nav-link-label">Home</span>
                </span>
              </a>
            </li>

            {/* Catalog — desktop has hover mega menu */}
            <li className="nav-item has-mega">
              <a href="#catalog" className="nav-link">
                <span className="nav-link-stack">
                  <FiGrid className="nav-link-icon" />
                  <span className="nav-link-label">Catalog</span>
                </span>
              </a>
              <DesktopCatalogMenu onNavigate={handleNavigate} />
            </li>

            {/* Furniture — desktop has hover mega menu */}
            <li className="nav-item has-mega">
              <a href="#furniture" className="nav-link">
                <span className="nav-link-stack">
                  <FiLayers className="nav-link-icon" />
                  <span className="nav-link-label">Furniture</span>
                </span>
              </a>
              <DesktopFurnitureMenu onNavigate={handleNavigate} />
            </li>

            {/* About */}
            <li className="nav-item">
              <a href="#about" className="nav-link" onClick={(e) => handleNavigate(e, "#about")}>
                <span className="nav-link-stack">
                  <FiInfo className="nav-link-icon" />
                  <span className="nav-link-label">About</span>
                </span>
              </a>
            </li>

          </ul>
        </nav>

        {/* ── Backdrop (mobile) ── */}
        <div
          className={`navbar-backdrop ${isMobileMenuOpen ? "active" : ""}`}
          onClick={closeMobileMenu}
        />

        {/* ── Desktop Auth ── */}
        <div className="header-auth-group desktop-only">
          {isLoggedIn ? (
            <div className="user-dropdown-wrap" ref={userMenuRef}>
              <button
                className="profile-trigger-btn profile-last-btn"
                title="User Menu"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
              >
                <span className="material-icons">account_circle</span>
                <span>Account</span>
                <span className="material-icons user-caret">
                  {isUserMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isUserMenuOpen && (
                <UserDropdown onNavigate={navigateToRoute} onLogout={handleLogout} />
              )}
            </div>
          ) : (
            <button className="blinkit-login-btn" onClick={handleAuthClick}>
              Login
            </button>
          )}
        </div>

        {/* ── Hamburger ── */}
        <div
          className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
          role="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </div>

      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE SLIDE-OUT PANEL
          Separate from <header> so it can scroll independently and show all
          categories without any accordion toggle.
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        className={`navbar ${isMobileMenuOpen ? "active" : ""}`}
        style={{
          // Override the navbar's flex/list layout — this is a full panel
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflowY: "auto",
          gap: 0,
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Primary links */}
        <span className="mob-section-label">Menu</span>

        {[
          { href: "#home",      label: "Home",      icon: "home"        },
          { href: "#about",     label: "About",     icon: "info_outline" },
        ].map(({ href, label, icon }) => (
          <button
            key={href}
            className="mob-account-row"
            onClick={(e) => handleNavigate({ preventDefault: () => {}, ...e }, href)}
          >
            <span className="material-icons">{icon}</span>
            {label}
          </button>
        ))}

        {/* ── Catalog cards (always visible) ── */}
        <MobileCatalogPanel onNavigate={handleNavigate} />

        {/* ── Furniture cards (always visible) ── */}
        <MobileFurniturePanel onNavigate={handleNavigate} />

        {/* Account links (logged-in only) */}
        {isLoggedIn && (
          <>
            <span className="mob-section-label">My Account</span>
            {ACCOUNT_ROUTES.map(({ label, path, icon }) => (
              <button key={path} className="mob-account-row" onClick={() => navigateToRoute(path)}>
                <span className="material-icons">{icon}</span>
                {label}
              </button>
            ))}
          </>
        )}

        {/* Auth CTA */}
        <button
          className={`mob-auth-cta ${isLoggedIn ? "logout-cta" : ""}`}
          onClick={() => { handleAuthClick(); closeMobileMenu(); }}
        >
          <span className="material-icons" style={{ fontSize: "1rem" }}>
            {isLoggedIn ? "logout" : "login"}
          </span>
          {isLoggedIn ? "Logout" : "Login / Sign Up"}
        </button>

      </div>
    </>
  );
};

export default Navbar;
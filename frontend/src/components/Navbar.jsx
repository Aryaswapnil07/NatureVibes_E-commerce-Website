import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiHome, FiInfo, FiLayers } from "react-icons/fi";
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
    links: ["Snake Plants", "Air Purifiers"],
  },
  {
    id: "cat-foliage",
    icon: "eco",
    label: "Foliage",
    links: ["Money Plants", "Monstera"],
  },
  {
    id: "cat-outdoor",
    icon: "wb_sunny",
    label: "Outdoor",
    links: ["Flowering", "Fruit Plants"],
  },
  {
    id: "cat-pots",
    icon: "build",
    label: "Essentials",
    links: ["Pots", "Tools"],
    isLast: true,
  },
];

const FURNITURE_CARDS = [
  { initial: "S", label: "Living Room", link: "Sofas", href: "#furniture" },
  { initial: "B", label: "Bedroom",     link: "Beds",  href: "#furniture" },
];

const ACCOUNT_ROUTES = [
  { label: "My Profile",     path: "/account/profile"         },
  { label: "Current Orders", path: "/account/orders/current"  },
  { label: "Order History",  path: "/account/orders/history"  },
  { label: "Address Book",   path: "/account/addresses"       },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const CatalogMegaMenu = ({ activeSubMenu, onNavigate }) => (
  <div className={`mega-menu-container ${activeSubMenu === "catalog" ? "mobile-open" : ""}`}>
    <div className="modern-mega-grid">
      {CATALOG_SECTIONS.map(({ id, icon, label, links, isLast }) => (
        <div
          key={id}
          className="mega-links-section"
          style={isLast ? { borderRight: "none" } : undefined}
        >
          <div className="mega-cat-header">
            <span className="material-icons" style={{ color: "var(--green)" }}>{icon}</span>
            <h4>{label}</h4>
          </div>
          <ul className="mega-link-list">
            {links.map((name) => (
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

const FurnitureMegaMenu = ({ activeSubMenu, onNavigate }) => (
  <div className={`mega-menu-container ${activeSubMenu === "furniture" ? "mobile-open" : ""}`}>
    <div className="mega-grid legacy-grid">
      {FURNITURE_CARDS.map(({ initial, label, link, href }) => (
        <div key={label} className="nav-card furniture-card">
          <div className="card-header">
            <span className="card-icon">{initial}</span>
            <h4>{label}</h4>
          </div>
          <ul>
            <li>
              <a href={href} onClick={(e) => onNavigate(e, href)}>{link}</a>
            </li>
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const UserDropdown = ({ onNavigate, onLogout }) => (
  <div className="user-dropdown-menu">
    {ACCOUNT_ROUTES.map(({ label, path }) => (
      <button key={path} onClick={() => onNavigate(path)}>
        {label}
      </button>
    ))}
    <button className="danger" onClick={onLogout}>Logout</button>
  </div>
);

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const Navbar = ({ onOpenLogin, onLogout, isLoggedIn, allProducts }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu,    setActiveSubMenu]    = useState(null);
  const [isUserMenuOpen,   setIsUserMenuOpen]   = useState(false);

  const userMenuRef       = useRef(null);
  const location          = useLocation();
  const navigate          = useNavigate();
  const searchPlaceholder = useRotatingPlaceholder(SEARCH_SUGGESTIONS);

  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);
  }, [location.pathname]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > NAV_COLLAPSE_WIDTH) {
        setIsMobileMenuOpen(false);
        setActiveSubMenu(null);
      }
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

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);
  }, []);

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

  const toggleSubMenu = useCallback((e, menuName) => {
    if (window.innerWidth > NAV_COLLAPSE_WIDTH) return;
    e.preventDefault();
    setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  const handleAuthClick = useCallback(() => {
    if (isLoggedIn) {
      onLogout?.();
      navigate("/");
    } else {
      onOpenLogin?.();
    }
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
    <header className="header-main">

      {/* Brand */}
      <Link
        to="/"
        className="brand-logo"
        onClick={(e) => handleNavigate(e, "#home")}
      >
        NatureVibes
      </Link>

      {/* Search */}
      <div className="blinkit-wrapper">
        <SearchBar placeholder={searchPlaceholder} products={allProducts} />
      </div>

      {/* Nav */}
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

          {/* Catalog (mega menu) */}
          <li className="nav-item has-mega">
            <a
              href="#catalog"
              className={`nav-link toggle-mega ${activeSubMenu === "catalog" ? "expanded" : ""}`}
              onClick={(e) => toggleSubMenu(e, "catalog")}
            >
              <span className="nav-link-stack">
                <FiGrid className="nav-link-icon" />
                <span className="nav-link-label">Catalog</span>
              </span>
            </a>
            <CatalogMegaMenu activeSubMenu={activeSubMenu} onNavigate={handleNavigate} />
          </li>

          {/* Furniture (mega menu) */}
          <li className="nav-item has-mega">
            <a
              href="#furniture"
              className={`nav-link toggle-mega ${activeSubMenu === "furniture" ? "expanded" : ""}`}
              onClick={(e) => toggleSubMenu(e, "furniture")}
            >
              <span className="nav-link-stack">
                <FiLayers className="nav-link-icon" />
                <span className="nav-link-label">Furniture</span>
              </span>
            </a>
            <FurnitureMegaMenu activeSubMenu={activeSubMenu} onNavigate={handleNavigate} />
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

          {/* Mobile-only account links (logged in) */}
          {isLoggedIn && ACCOUNT_ROUTES.map(({ label, path }) => (
            <li key={path} className="nav-item mobile-only">
              <button className="nav-link mobile-auth-btn" onClick={() => navigateToRoute(path)}>
                {label}
              </button>
            </li>
          ))}

          {/* Mobile-only auth toggle */}
          <li className="nav-item mobile-only">
            <button
              className="nav-link mobile-auth-btn"
              onClick={() => { handleAuthClick(); closeMobileMenu(); }}
            >
              {isLoggedIn ? "Logout" : "Login / Signup"}
            </button>
          </li>

        </ul>
      </nav>

      {/* Backdrop (mobile) */}
      <div
        className={`navbar-backdrop ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      />

      {/* Desktop auth */}
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

      {/* Hamburger */}
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
  );
};

export default Navbar;
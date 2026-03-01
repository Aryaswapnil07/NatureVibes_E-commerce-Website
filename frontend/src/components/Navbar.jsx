import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiHome, FiInfo, FiLayers, FiChevronDown, FiX, FiMenu } from "react-icons/fi";
import SearchBar from "./SearchBar";
import "./css/navbar.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_COLLAPSE_WIDTH = 1024;

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
    description: "Perfect for homes & offices",
    links: [
      { name: "Snake Plants", badge: "popular" },
      { name: "Air Purifiers", badge: null },
      { name: "ZZ Plants", badge: null },
      { name: "Pothos", badge: "new" },
    ],
  },
  {
    id: "cat-foliage",
    icon: "eco",
    label: "Foliage",
    description: "Lush tropical vibes",
    links: [
      { name: "Money Plants", badge: null },
      { name: "Monstera", badge: "trending" },
      { name: "Ferns", badge: null },
      { name: "Calathea", badge: "new" },
    ],
  },
  {
    id: "cat-outdoor",
    icon: "wb_sunny",
    label: "Outdoor",
    description: "Garden & balcony beauties",
    links: [
      { name: "Flowering Plants", badge: null },
      { name: "Fruit Plants", badge: null },
      { name: "Shrubs", badge: null },
      { name: "Climbers", badge: "new" },
    ],
  },
  {
    id: "cat-essentials",
    icon: "build",
    label: "Essentials",
    description: "Tools, pots & care kits",
    links: [
      { name: "Ceramic Pots", badge: "popular" },
      { name: "Grow Bags", badge: null },
      { name: "Garden Tools", badge: null },
      { name: "Fertilizers", badge: null },
    ],
  },
];

const FURNITURE_SECTIONS = [
  {
    id: "furn-living",
    initial: "L",
    label: "Living Room",
    color: "#e8f5e9",
    links: ["Sofas", "Coffee Tables", "TV Units", "Recliners"],
  },
  {
    id: "furn-bedroom",
    initial: "B",
    label: "Bedroom",
    color: "#fff8e1",
    links: ["Beds", "Wardrobes", "Side Tables", "Dressers"],
  },
  {
    id: "furn-outdoor",
    initial: "O",
    label: "Outdoor",
    color: "#e3f2fd",
    links: ["Garden Chairs", "Hammocks", "Planters", "Benches"],
  },
];

const ACCOUNT_ROUTES = [
  { label: "My Profile", path: "/account/profile", icon: "person" },
  { label: "Current Orders", path: "/account/orders/current", icon: "local_shipping" },
  { label: "Order History", path: "/account/orders/history", icon: "history" },
  { label: "Address Book", path: "/account/addresses", icon: "location_on" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const CatalogMegaMenu = ({ activeSubMenu, onNavigate }) => (
  <div className={`mega-menu-container catalog-menu ${activeSubMenu === "catalog" ? "mobile-open" : ""}`}>
    <div className="mega-menu-inner">
      <div className="mega-menu-grid">
        {CATALOG_SECTIONS.map(({ id, icon, label, description, links }) => (
          <div key={id} className="mega-section">
            <div className="mega-section-header">
              <span className="material-icons mega-section-icon">{icon}</span>
              <div>
                <h4 className="mega-section-title">{label}</h4>
                <p className="mega-section-desc">{description}</p>
              </div>
            </div>
            <ul className="mega-link-list">
              {links.map(({ name, badge }) => (
                <li key={name}>
                  <a href={`#${id}`} onClick={(e) => onNavigate(e, `#${id}`)}>
                    <span className="mega-link-text">{name}</span>
                    {badge && (
                      <span className={`mega-badge badge-${badge}`}>{badge}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mega-promo-panel">
        <div className="mega-promo-bg" />
        <div className="mega-promo-content">
          <span className="mega-promo-tag">🌿 Season Sale</span>
          <h3>Fresh Arrivals</h3>
          <p>New plants every week. Curated for every space.</p>
          <a href="#catalog" className="mega-promo-btn" onClick={(e) => onNavigate(e, "#catalog")}>
            Shop Now <span>→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
);

const FurnitureMegaMenu = ({ activeSubMenu, onNavigate }) => (
  <div className={`mega-menu-container furniture-menu ${activeSubMenu === "furniture" ? "mobile-open" : ""}`}>
    <div className="mega-menu-inner">
      <div className="furniture-grid">
        {FURNITURE_SECTIONS.map(({ id, initial, label, color, links }) => (
          <div key={id} className="furniture-card" style={{ "--card-tint": color }}>
            <div className="furniture-card-header">
              <span className="furniture-initial" style={{ background: color }}>{initial}</span>
              <h4>{label}</h4>
            </div>
            <ul className="furniture-links">
              {links.map((name) => (
                <li key={name}>
                  <a href={`#${id}`} onClick={(e) => onNavigate(e, `#${id}`)}>{name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mega-promo-panel furniture-promo-panel">
        <div
          className="mega-promo-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80')",
          }}
        />
        <div className="mega-promo-content">
          <span className="mega-promo-tag">🛋️ New Collection</span>
          <h3>Nature-Inspired Furniture</h3>
          <p>Biophilic designs for modern living.</p>
          <a href="#furniture" className="mega-promo-btn" onClick={(e) => onNavigate(e, "#furniture")}>
            Explore <span>→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
);

const UserDropdown = ({ onNavigate, onLogout }) => (
  <div className="user-dropdown-menu">
    {ACCOUNT_ROUTES.map(({ label, path, icon }) => (
      <button key={path} onClick={() => onNavigate(path)}>
        <span className="material-icons dropdown-icon">{icon}</span>
        {label}
      </button>
    ))}
    <div className="dropdown-divider" />
    <button className="danger" onClick={onLogout}>
      <span className="material-icons dropdown-icon">logout</span>
      Logout
    </button>
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
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchPlaceholder = useRotatingPlaceholder(SEARCH_SUGGESTIONS);

  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);
  }, [location.pathname]);

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
    const el = document.querySelector(targetId);
    const header = document.querySelector(".header-main");
    if (!el) return;
    const offset = Math.round(header?.getBoundingClientRect().height ?? 80);
    const bodyTop = document.body.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top - bodyTop;
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
      <Link to="/" className="brand-logo" onClick={(e) => handleNavigate(e, "#home")}>
        <span className="brand-leaf">🌿</span>
        <span className="brand-text">NatureVibes</span>
      </Link>

      {/* Search */}
      <div className="search-wrapper">
        <SearchBar placeholder={searchPlaceholder} products={allProducts} />
      </div>

      {/* Desktop Nav */}
      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`} aria-label="Main navigation">
        <ul className="nav-list">

          {/* Home */}
          <li className="nav-item">
            <a href="#home" className="nav-link" onClick={(e) => handleNavigate(e, "#home")}>
              <FiHome className="nav-link-icon" />
              <span className="nav-link-label">Home</span>
            </a>
          </li>

          {/* Catalog */}
          <li className="nav-item has-mega">
            <a
              href="#catalog"
              className={`nav-link toggle-mega ${activeSubMenu === "catalog" ? "expanded" : ""}`}
              onClick={(e) => toggleSubMenu(e, "catalog")}
              aria-expanded={activeSubMenu === "catalog"}
            >
              <FiGrid className="nav-link-icon" />
              <span className="nav-link-label">Catalog</span>
              <FiChevronDown className="nav-chevron" />
            </a>
            <CatalogMegaMenu activeSubMenu={activeSubMenu} onNavigate={handleNavigate} />
          </li>

          {/* Furniture */}
          <li className="nav-item has-mega">
            <a
              href="#furniture"
              className={`nav-link toggle-mega ${activeSubMenu === "furniture" ? "expanded" : ""}`}
              onClick={(e) => toggleSubMenu(e, "furniture")}
              aria-expanded={activeSubMenu === "furniture"}
            >
              <FiLayers className="nav-link-icon" />
              <span className="nav-link-label">Furniture</span>
              <FiChevronDown className="nav-chevron" />
            </a>
            <FurnitureMegaMenu activeSubMenu={activeSubMenu} onNavigate={handleNavigate} />
          </li>

          {/* About */}
          <li className="nav-item">
            <a href="#about" className="nav-link" onClick={(e) => handleNavigate(e, "#about")}>
              <FiInfo className="nav-link-icon" />
              <span className="nav-link-label">About</span>
            </a>
          </li>

          {/* Mobile-only account links */}
          {isLoggedIn && (
            <li className="nav-item mobile-only mobile-account-section">
              <span className="mobile-section-label">My Account</span>
              {ACCOUNT_ROUTES.map(({ label, path, icon }) => (
                <button key={path} className="nav-link mobile-auth-btn" onClick={() => navigateToRoute(path)}>
                  <span className="material-icons nav-link-icon">{icon}</span>
                  <span className="nav-link-label">{label}</span>
                </button>
              ))}
            </li>
          )}

          {/* Mobile-only auth toggle */}
          <li className="nav-item mobile-only">
            <button
              className={`nav-link mobile-auth-btn ${isLoggedIn ? "logout-mobile" : "login-mobile"}`}
              onClick={() => { handleAuthClick(); closeMobileMenu(); }}
            >
              <span className="material-icons nav-link-icon">{isLoggedIn ? "logout" : "login"}</span>
              <span className="nav-link-label">{isLoggedIn ? "Logout" : "Login / Signup"}</span>
            </button>
          </li>

        </ul>
      </nav>

      {/* Backdrop */}
      <div
        className={`navbar-backdrop ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Desktop auth */}
      <div className="header-auth-group desktop-only">
        {isLoggedIn ? (
          <div className="user-dropdown-wrap" ref={userMenuRef}>
            <button
              className="profile-trigger-btn"
              title="User Menu"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-expanded={isUserMenuOpen}
            >
              <span className="material-icons">account_circle</span>
              <span>Account</span>
              <FiChevronDown className={`user-caret ${isUserMenuOpen ? "rotated" : ""}`} />
            </button>
            {isUserMenuOpen && (
              <UserDropdown onNavigate={navigateToRoute} onLogout={handleLogout} />
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={handleAuthClick}>
            Login
          </button>
        )}
      </div>

      {/* Hamburger */}
      <button
        className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

    </header>
  );
};

export default Navbar;
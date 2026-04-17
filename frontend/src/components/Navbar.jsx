import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiHome,
  FiInfo,
  FiChevronDown,
  FiX,
  FiMenu,
} from "react-icons/fi";
import SearchBar from "./SearchBar";
import "./css/navbar.css";

const NAV_COLLAPSE_WIDTH = 1024;

const SEARCH_SUGGESTIONS = [
  'Search "Snake Plant"',
  'Search "Indoor Plants"',
  'Search "Ceramic Pots"',
  'Search "Flower Seeds"',
  'Search "Air Purifying"',
];

const ACCOUNT_ROUTES = [
  { label: "My Profile", path: "/account/profile", icon: "person" },
  { label: "Current Orders", path: "/account/orders/current", icon: "local_shipping" },
  { label: "Order History", path: "/account/orders/history", icon: "history" },
  { label: "Address Book", path: "/account/addresses", icon: "location_on" },
];

const CatalogMegaMenu = ({ activeSubMenu, onNavigate, catalogSections = [] }) => {
  const visibleSections = catalogSections.slice(0, 16);

  return (
    <div
      className={`mega-menu-container catalog-menu ${
        activeSubMenu === "catalog" ? "mobile-open" : ""
      }`}
    >
      <div className="mega-menu-inner">
        <div className="mega-menu-grid">
          {visibleSections.length > 0 ? (
            visibleSections.map((section) => (
              <div key={section.key} className="mega-section">
                <div className="mega-section-header">
                  <span className="material-icons mega-section-icon">eco</span>
                  <div>
                    <h4 className="mega-section-title">{section.title}</h4>
                    <p className="mega-section-desc">
                      {section.description || `${section.products.length} products`}
                    </p>
                  </div>
                </div>
                <ul className="mega-link-list">
                  {(section.products || []).slice(0, 4).map((product) => (
                    <li key={`${section.key}-${product.id}`}>
                      <a
                        href={`#${section.id}`}
                        onClick={(event) => onNavigate(event, `#${section.id}`)}
                      >
                        <span className="mega-link-text">{product.name}</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href={`#${section.id}`}
                      onClick={(event) => onNavigate(event, `#${section.id}`)}
                    >
                      <span className="mega-link-text">View all</span>
                    </a>
                  </li>
                </ul>
              </div>
            ))
          ) : (
            <div className="mega-section">
              <div className="mega-section-header">
                <span className="material-icons mega-section-icon">inventory_2</span>
                <div>
                  <h4 className="mega-section-title">Catalog Updating</h4>
                  <p className="mega-section-desc">Categories will appear once products are added.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mega-promo-panel">
          <div className="mega-promo-bg" />
          <div className="mega-promo-content">
            <span className="mega-promo-tag">Fresh Stock</span>
            <h3>Shop by Category</h3>
            <p>Browse indoor, outdoor, seeds, pots, and plant care products.</p>
            <a
              href="#full-catalog"
              className="mega-promo-btn"
              onClick={(event) => onNavigate(event, "#full-catalog")}
            >
              Explore Catalog <span>-&gt;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

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

function useRotatingPlaceholder(suggestions, intervalMs = 2500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((currentIndex) => (currentIndex + 1) % suggestions.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [suggestions, intervalMs]);
  return suggestions[index];
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const NavbarContent = ({
  onOpenLogin,
  onLogout,
  isLoggedIn,
  allProducts,
  catalogSections = [],
  pathname,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const searchPlaceholder = useRotatingPlaceholder(SEARCH_SUGGESTIONS);

  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);
  }, []);

  const scrollToSection = useCallback((targetId) => {
    const targetElement = document.querySelector(targetId);
    const header = document.querySelector(".header-main");

    if (!targetElement) return;

    const offset = Math.round(header?.getBoundingClientRect().height ?? 80);
    const bodyTop = document.body.getBoundingClientRect().top;
    const elementTop = targetElement.getBoundingClientRect().top - bodyTop;

    window.scrollTo({ top: elementTop - offset, behavior: "smooth" });
  }, []);

  const handleNavigate = useCallback(
    (event, target) => {
      if (!target.startsWith("#")) return;

      event.preventDefault();
      closeMobileMenu();

      if (pathname !== "/") {
        navigate("/");
        setTimeout(() => scrollToSection(target), 120);
      } else {
        scrollToSection(target);
      }
    },
    [pathname, navigate, closeMobileMenu, scrollToSection]
  );

  const toggleSubMenu = useCallback((event, menuName) => {
    if (window.innerWidth > NAV_COLLAPSE_WIDTH) return;
    event.preventDefault();
    setActiveSubMenu((previous) => (previous === menuName ? null : menuName));
  }, []);

  const handleAuthClick = useCallback(() => {
    if (isLoggedIn) {
      onLogout?.();
      navigate("/");
    } else {
      onOpenLogin?.();
    }
  }, [isLoggedIn, onLogout, onOpenLogin, navigate]);

  const navigateToRoute = useCallback(
    (route) => {
      setIsUserMenuOpen(false);
      closeMobileMenu();
      navigate(route);
    },
    [navigate, closeMobileMenu]
  );

  const handleLogout = useCallback(() => {
    setIsUserMenuOpen(false);
    onLogout?.();
    navigate("/");
  }, [onLogout, navigate]);

  return (
    <header className="header-main">
      <Link to="/" className="brand-logo" onClick={(event) => handleNavigate(event, "#home")}>
        <span className="material-icons brand-leaf" aria-hidden="true">
          spa
        </span>
        <span className="brand-text">NatureVibes</span>
      </Link>

      <div className="search-wrapper">
        <SearchBar placeholder={searchPlaceholder} products={allProducts} />
      </div>

      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`} aria-label="Main navigation">
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#home" className="nav-link" onClick={(event) => handleNavigate(event, "#home")}>
              <FiHome className="nav-link-icon" />
              <span className="nav-link-label">Home</span>
            </a>
          </li>

          <li className="nav-item has-mega">
            <a
              href="#full-catalog"
              className={`nav-link toggle-mega ${activeSubMenu === "catalog" ? "expanded" : ""}`}
              onClick={(event) => {
                if (window.innerWidth > NAV_COLLAPSE_WIDTH) {
                  handleNavigate(event, "#full-catalog");
                  return;
                }
                toggleSubMenu(event, "catalog");
              }}
              aria-expanded={activeSubMenu === "catalog"}
            >
              <FiGrid className="nav-link-icon" />
              <span className="nav-link-label">Categories</span>
              <FiChevronDown className="nav-chevron" />
            </a>
            <CatalogMegaMenu
              activeSubMenu={activeSubMenu}
              onNavigate={handleNavigate}
              catalogSections={catalogSections}
            />
          </li>

          <li className="nav-item">
            <a href="#about" className="nav-link" onClick={(event) => handleNavigate(event, "#about")}>
              <FiInfo className="nav-link-icon" />
              <span className="nav-link-label">About</span>
            </a>
          </li>

          {isLoggedIn && (
            <li className="nav-item mobile-only mobile-account-section">
              <span className="mobile-section-label">My Account</span>
              {ACCOUNT_ROUTES.map(({ label, path, icon }) => (
                <button
                  key={path}
                  className="nav-link mobile-auth-btn"
                  onClick={() => navigateToRoute(path)}
                >
                  <span className="material-icons nav-link-icon">{icon}</span>
                  <span className="nav-link-label">{label}</span>
                </button>
              ))}
            </li>
          )}

          <li className="nav-item mobile-only">
            <button
              className={`nav-link mobile-auth-btn ${
                isLoggedIn ? "logout-mobile" : "login-mobile"
              }`}
              onClick={() => {
                handleAuthClick();
                closeMobileMenu();
              }}
            >
              <span className="material-icons nav-link-icon">
                {isLoggedIn ? "logout" : "login"}
              </span>
              <span className="nav-link-label">
                {isLoggedIn ? "Logout" : "Login / Signup"}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <div
        className={`navbar-backdrop ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <div className="header-auth-group desktop-only">
        {isLoggedIn ? (
          <div className="user-dropdown-wrap" ref={userMenuRef}>
            <button
              className="profile-trigger-btn"
              title="User Menu"
              onClick={() => setIsUserMenuOpen((previous) => !previous)}
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

      <button
        className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((previous) => !previous)}
      >
        {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
    </header>
  );
};

const Navbar = (props) => {
  const location = useLocation();

  return <NavbarContent key={location.pathname} pathname={location.pathname} {...props} />;
};

export default Navbar;

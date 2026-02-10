import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ Import Router hooks
import SearchBar from "./SearchBar"; // ✅ Import the SearchBar component
import "./css/Navbar.css";

const Navbar = ({ onOpenLogin, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    'Search "Snake Plant..."'
  );

  const location = useLocation();
  const navigate = useNavigate();

  // ---------------- 1. Search Placeholder Animation ----------------
  useEffect(() => {
    const suggestions = [
      'Search "Snake Plant"',
      'Search "Tomato Seeds"',
      'Search "Ceramic Pot"',
      'Search "Fertilizer"',
      'Search "Office Chair"',
    ];

    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % suggestions.length;
      setSearchPlaceholder(suggestions[index]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  // ---------------- 2. Smart Navigation Logic ----------------
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleSubMenu = (e, menuName) => {
    // Only toggle on mobile; hover works via CSS on desktop
    if (window.innerWidth <= 992) {
      e.preventDefault();
      setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
    }
  };

  const handleNavigation = (e, targetId) => {
    if (targetId.startsWith("#")) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      setActiveSubMenu(null);

      // If NOT on home page, go home first, then scroll
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          scrollToSection(targetId);
        }, 100);
      } else {
        // If already on home page, just scroll
        scrollToSection(targetId);
      }
    }
  };

  const scrollToSection = (targetId) => {
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80; // Height of your fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="header-main">
      {/* ---------------- Logo ---------------- */}
      <Link 
        to="/" 
        className="brand-logo" 
        onClick={(e) => handleNavigation(e, "#home")}
      >
        NatureVibes
      </Link>

      {/* ---------------- Search + Login ---------------- */}
      <div className="blinkit-wrapper">
        
        {/* ✅ FIXED: Replaced static input with the SearchBar component */}
        <SearchBar placeholder={searchPlaceholder} />

        {/* ✅ FIXED: Added 'desktop-only' class to hide this button on mobile */}
        <div className="header-auth-group desktop-only">
          <button className="blinkit-login-btn" onClick={onOpenLogin}>
            Login
          </button>
        </div>
      </div>

      {/* ---------------- Hamburger Icon ---------------- */}
      <div
        className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileMenu}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* ---------------- Navigation Menu ---------------- */}
      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
        <ul className="nav-list">
          
          <li className="nav-item">
            <a 
              href="#home" 
              className="nav-link" 
              onClick={(e) => handleNavigation(e, "#home")}
            >
              Home
            </a>
          </li>

          {/* Catalog Mega Menu */}
          <li className="nav-item has-mega">
            <a
              href="#catalog"
              className="nav-link toggle-mega"
              onClick={(e) => toggleSubMenu(e, "catalog")}
            >
              Catalog ▾
            </a>
            {/* ... (Your Mega Menu Content remains the same) ... */}
             <div className={`mega-menu-container ${activeSubMenu === "catalog" ? "mobile-open" : ""}`}>
              <div className="modern-mega-grid">
                {/* Column 1 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>home</span>
                    <h4>Indoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li><a href="#cat-indoor" onClick={(e) => handleNavigation(e, "#cat-indoor")}>Snake Plants</a></li>
                    <li><a href="#cat-indoor" onClick={(e) => handleNavigation(e, "#cat-indoor")}>Air Purifiers</a></li>
                  </ul>
                </div>
                 {/* Column 2 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>eco</span>
                    <h4>Foliage</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li><a href="#cat-foliage" onClick={(e) => handleNavigation(e, "#cat-foliage")}>Money Plants</a></li>
                    <li><a href="#cat-foliage" onClick={(e) => handleNavigation(e, "#cat-foliage")}>Monstera</a></li>
                  </ul>
                </div>
                 {/* Column 3 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>wb_sunny</span>
                    <h4>Outdoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li><a href="#cat-outdoor" onClick={(e) => handleNavigation(e, "#cat-outdoor")}>Flowering</a></li>
                    <li><a href="#cat-outdoor" onClick={(e) => handleNavigation(e, "#cat-outdoor")}>Fruit Plants</a></li>
                  </ul>
                </div>
                 {/* Column 4 */}
                <div className="mega-links-section" style={{ borderRight: "none" }}>
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>build</span>
                    <h4>Essentials</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li><a href="#cat-pots" onClick={(e) => handleNavigation(e, "#cat-pots")}>Pots</a></li>
                    <li><a href="#cat-pots" onClick={(e) => handleNavigation(e, "#cat-pots")}>Tools</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          {/* Furniture Mega Menu */}
          <li className="nav-item has-mega">
            <a
              href="#furniture"
              className="nav-link toggle-mega"
              onClick={(e) => toggleSubMenu(e, "furniture")}
            >
              Furniture ▾
            </a>
            <div className={`mega-menu-container ${activeSubMenu === "furniture" ? "mobile-open" : ""}`}>
              <div className="mega-grid legacy-grid">
                <div className="nav-card furniture-card">
                  <div className="card-header">
                    <span className="card-icon">🛋️</span>
                    <h4>Living Room</h4>
                  </div>
                  <ul>
                    <li><a href="#furniture" onClick={(e) => handleNavigation(e, "#furniture")}>Sofas</a></li>
                  </ul>
                </div>
                <div className="nav-card furniture-card">
                   <div className="card-header">
                    <span className="card-icon">🛏️</span>
                    <h4>Bedroom</h4>
                  </div>
                  <ul>
                    <li><a href="#furniture" onClick={(e) => handleNavigation(e, "#furniture")}>Beds</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li className="nav-item">
            <a 
              href="#about" 
              className="nav-link" 
              onClick={(e) => handleNavigation(e, "#about")}
            >
              About
            </a>
          </li>
          
          {/* ✅ FIXED: Added 'mobile-only' class so this ONLY shows on mobile */}
          <li className="nav-item mobile-only">
            <button 
              className="nav-link mobile-auth-btn" 
              onClick={() => {
                onOpenLogin();
                setIsMobileMenuOpen(false); // Close menu on click
              }} 
            >
              Login / Signup
            </button>
          </li>

        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
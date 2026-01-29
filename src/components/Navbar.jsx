import React, { useState, useEffect } from "react";
import "./css/Navbar.css";

const Navbar = ({ onOpenLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    'Search "Snake Plant..."'
  );

  // ---------------- Search Placeholder Animation ----------------
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

  // ---------------- Mobile Menu Toggle ----------------
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // ---------------- Submenu Toggle (Mobile Only) ----------------
  const toggleSubMenu = (e, menuName) => {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
    }
  };

  return (
    <header className="header-main">
      {/* ---------------- Logo ---------------- */}
      <a href="#home" className="brand-logo">
        NatureVibes
      </a>

      {/* ---------------- Search + Login ---------------- */}
      <div className="blinkit-wrapper">
        <div className="blinkit-search-box">
          <span className="material-icons blinkit-search-icon">search</span>
          <input
            type="text"
            className="blinkit-input"
            placeholder={searchPlaceholder}
          />
        </div>

        {/* ✅ LOGIN BUTTON (FIXED) */}
        <button
          className="blinkit-login-btn"
          onClick={onOpenLogin}
        >
          Login
        </button>
      </div>

      {/* ---------------- Hamburger ---------------- */}
      <div
        className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileMenu}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* ---------------- Navigation ---------------- */}
      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#home" className="nav-link">
              Home
            </a>
          </li>

          {/* ================= Catalog Mega Menu ================= */}
          <li className="nav-item has-mega">
            <a
              href="#catalog"
              className="nav-link toggle-mega"
              onClick={(e) => toggleSubMenu(e, "catalog")}
            >
              Catalog ▾
            </a>

            <div
              className={`mega-menu-container ${
                activeSubMenu === "catalog" ? "mobile-open" : ""
              }`}
            >
              <div className="modern-mega-grid">

                {/* Column 1 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      home
                    </span>
                    <h4>Indoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <span className="sub-cat-label">Snake Plants</span>
                    <li><a href="#cat-indoor">Laurentii</a></li>
                    <li><a href="#cat-indoor">Moonshine</a></li>
                    <li><a href="#cat-indoor">Cylindrica</a></li>

                    <span className="sub-cat-label">Air Purifiers</span>
                    <li><a href="#cat-indoor">Areca Palm</a></li>
                    <li><a href="#cat-indoor">Rubber Plant</a></li>
                    <li><a href="#cat-indoor">Spider Plant</a></li>
                  </ul>
                </div>

                {/* Column 2 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      eco
                    </span>
                    <h4>Foliage</h4>
                  </div>
                  <ul className="mega-link-list">
                    <span className="sub-cat-label">Money Plants</span>
                    <li>
                      <a href="#cat-foliage">
                        Golden Pothos <span className="menu-badge badge-hot">Hot</span>
                      </a>
                    </li>
                    <li><a href="#cat-foliage">Marble Queen</a></li>
                    <li><a href="#cat-foliage">Neon Pothos</a></li>

                    <span className="sub-cat-label">Exotic</span>
                    <li><a href="#cat-foliage">Monstera Deliciosa</a></li>
                    <li><a href="#cat-foliage">Philodendron Birkin</a></li>
                    <li><a href="#cat-foliage">Aglaonema Red</a></li>
                  </ul>
                </div>

                {/* Column 3 */}
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      wb_sunny
                    </span>
                    <h4>Outdoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <span className="sub-cat-label">Flowering</span>
                    <li><a href="#cat-outdoor">Desi Rose</a></li>
                    <li><a href="#cat-outdoor">Hibiscus</a></li>
                    <li><a href="#cat-outdoor">Bougainvillea</a></li>
                    <li><a href="#cat-outdoor">Jasmine / Mogra</a></li>

                    <span className="sub-cat-label">Edible Garden</span>
                    <li><a href="#cat-outdoor">Mango Varieties</a></li>
                    <li>
                      <a href="#cat-outdoor">
                        Organic Veg Seeds <span className="menu-badge badge-new">New</span>
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 4 */}
                <div className="mega-links-section" style={{ borderRight: "none" }}>
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      build
                    </span>
                    <h4>Essentials</h4>
                  </div>
                  <ul className="mega-link-list">
                    <span className="sub-cat-label">Pots & Planters</span>
                    <li><a href="#cat-pots">Ceramic Pots</a></li>
                    <li><a href="#cat-pots">Terracotta</a></li>
                    <li><a href="#cat-pots">Hanging Planters</a></li>

                    <span className="sub-cat-label">Plant Care</span>
                    <li><a href="#cat-pots">Potting Mix</a></li>
                    <li><a href="#cat-pots">Vermicompost</a></li>
                    <li><a href="#cat-pots">Gardening Tools</a></li>
                  </ul>
                </div>

                {/* Visual Side */}
                <div className="mega-visual-side">
                  <div className="mega-visual-bg"></div>
                  <div className="visual-content">
                    <h3>New Arrivals</h3>
                    <p>Check out our rare Cactus collection dropping this week.</p>
                    <a href="#cat-cacti" className="visual-btn">
                      Shop Now
                      <span className="material-icons" style={{ fontSize: "1rem" }}>
                        arrow_forward
                      </span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </li>

          {/* ================= Furniture Mega Menu ================= */}
          <li className="nav-item has-mega">
            <a
              href="#furniture"
              className="nav-link toggle-mega"
              onClick={(e) => toggleSubMenu(e, "furniture")}
            >
              Furniture ▾
            </a>

            <div
              className={`mega-menu-container ${
                activeSubMenu === "furniture" ? "mobile-open" : ""
              }`}
            >
              <div className="mega-grid legacy-grid">
                <div className="nav-card furniture-card">
                  <div className="card-header">
                    <span className="card-icon">🛋️</span>
                    <h4>Living Room</h4>
                  </div>
                  <ul>
                    <li><a href="#furniture">Sofa Sets</a></li>
                    <li><a href="#furniture">Coffee Tables</a></li>
                  </ul>
                </div>

                <div className="nav-card furniture-card">
                  <div className="card-header">
                    <span className="card-icon">🛏️</span>
                    <h4>Bedroom</h4>
                  </div>
                  <ul>
                    <li><a href="#furniture">King Beds</a></li>
                    <li><a href="#furniture">Wardrobes</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li className="nav-item">
            <a href="#about" className="nav-link">
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

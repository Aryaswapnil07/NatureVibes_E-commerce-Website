import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "./css/navbar.css";

const NAV_COLLAPSE_WIDTH = 1100;

const Navbar = ({ onOpenLogin, onLogout, isLoggedIn, allProducts }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search "Snake Plant..."');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > NAV_COLLAPSE_WIDTH) {
        setIsMobileMenuOpen(false);
        setActiveSubMenu(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleSubMenu = (event, menuName) => {
    if (window.innerWidth <= NAV_COLLAPSE_WIDTH) {
      event.preventDefault();
      setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
    }
  };

  const scrollToSection = (targetId) => {
    const element = document.querySelector(targetId);
    if (!element) return;

    const headerElement = document.querySelector(".header-main");
    const offset = Math.round(headerElement?.getBoundingClientRect().height || 80);
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const handleNavigation = (event, targetId) => {
    if (!targetId.startsWith("#")) return;

    event.preventDefault();
    setIsMobileMenuOpen(false);
    setActiveSubMenu(null);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        scrollToSection(targetId);
      }, 100);
      return;
    }

    scrollToSection(targetId);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      onLogout();
      navigate("/");
      return;
    }
    onOpenLogin();
  };

  const openUserRoute = (route) => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate(route);
  };

  return (
    <header className="header-main">
      <Link to="/" className="brand-logo" onClick={(event) => handleNavigation(event, "#home")}>
        NatureVibes
      </Link>

      <div className="blinkit-wrapper">
        <SearchBar placeholder={searchPlaceholder} products={allProducts} />
      </div>

      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#home" className="nav-link" onClick={(event) => handleNavigation(event, "#home")}>
              Home
            </a>
          </li>

          <li className="nav-item has-mega">
            <a
              href="#catalog"
              className={`nav-link toggle-mega ${activeSubMenu === "catalog" ? "expanded" : ""}`}
              onClick={(event) => toggleSubMenu(event, "catalog")}
            >
              Catalog
            </a>
            <div className={`mega-menu-container ${activeSubMenu === "catalog" ? "mobile-open" : ""}`}>
              <div className="modern-mega-grid">
                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      home
                    </span>
                    <h4>Indoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li>
                      <a href="#cat-indoor" onClick={(event) => handleNavigation(event, "#cat-indoor")}>
                        Snake Plants
                      </a>
                    </li>
                    <li>
                      <a href="#cat-indoor" onClick={(event) => handleNavigation(event, "#cat-indoor")}>
                        Air Purifiers
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      eco
                    </span>
                    <h4>Foliage</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li>
                      <a href="#cat-foliage" onClick={(event) => handleNavigation(event, "#cat-foliage")}>
                        Money Plants
                      </a>
                    </li>
                    <li>
                      <a href="#cat-foliage" onClick={(event) => handleNavigation(event, "#cat-foliage")}>
                        Monstera
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mega-links-section">
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      wb_sunny
                    </span>
                    <h4>Outdoor</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li>
                      <a href="#cat-outdoor" onClick={(event) => handleNavigation(event, "#cat-outdoor")}>
                        Flowering
                      </a>
                    </li>
                    <li>
                      <a href="#cat-outdoor" onClick={(event) => handleNavigation(event, "#cat-outdoor")}>
                        Fruit Plants
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mega-links-section" style={{ borderRight: "none" }}>
                  <div className="mega-cat-header">
                    <span className="material-icons" style={{ color: "var(--green)" }}>
                      build
                    </span>
                    <h4>Essentials</h4>
                  </div>
                  <ul className="mega-link-list">
                    <li>
                      <a href="#cat-pots" onClick={(event) => handleNavigation(event, "#cat-pots")}>
                        Pots
                      </a>
                    </li>
                    <li>
                      <a href="#cat-pots" onClick={(event) => handleNavigation(event, "#cat-pots")}>
                        Tools
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li className="nav-item has-mega">
            <a
              href="#furniture"
              className={`nav-link toggle-mega ${activeSubMenu === "furniture" ? "expanded" : ""}`}
              onClick={(event) => toggleSubMenu(event, "furniture")}
            >
              Furniture
            </a>
            <div className={`mega-menu-container ${activeSubMenu === "furniture" ? "mobile-open" : ""}`}>
              <div className="mega-grid legacy-grid">
                <div className="nav-card furniture-card">
                  <div className="card-header">
                    <span className="card-icon">S</span>
                    <h4>Living Room</h4>
                  </div>
                  <ul>
                    <li>
                      <a href="#furniture" onClick={(event) => handleNavigation(event, "#furniture")}>
                        Sofas
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="nav-card furniture-card">
                  <div className="card-header">
                    <span className="card-icon">B</span>
                    <h4>Bedroom</h4>
                  </div>
                  <ul>
                    <li>
                      <a href="#furniture" onClick={(event) => handleNavigation(event, "#furniture")}>
                        Beds
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li className="nav-item">
            <a href="#about" className="nav-link" onClick={(event) => handleNavigation(event, "#about")}>
              About
            </a>
          </li>

          {isLoggedIn ? (
            <>
              <li className="nav-item mobile-only">
                <button className="nav-link mobile-auth-btn" onClick={() => openUserRoute("/account/profile")}>
                  My Profile
                </button>
              </li>
              <li className="nav-item mobile-only">
                <button
                  className="nav-link mobile-auth-btn"
                  onClick={() => openUserRoute("/account/orders/current")}
                >
                  Current Orders
                </button>
              </li>
              <li className="nav-item mobile-only">
                <button
                  className="nav-link mobile-auth-btn"
                  onClick={() => openUserRoute("/account/orders/history")}
                >
                  Order History
                </button>
              </li>
              <li className="nav-item mobile-only">
                <button
                  className="nav-link mobile-auth-btn"
                  onClick={() => openUserRoute("/account/addresses")}
                >
                  Address Book
                </button>
              </li>
            </>
          ) : null}

          <li className="nav-item mobile-only">
            <button
              className="nav-link mobile-auth-btn"
              onClick={() => {
                handleAuthClick();
                setIsMobileMenuOpen(false);
              }}
            >
              {isLoggedIn ? "Logout" : "Login / Signup"}
            </button>
          </li>
        </ul>
      </nav>

      <div
        className={`navbar-backdrop ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => {
          setIsMobileMenuOpen(false);
          setActiveSubMenu(null);
        }}
      />

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

            {isUserMenuOpen ? (
              <div className="user-dropdown-menu">
                <button onClick={() => openUserRoute("/account/profile")}>My Profile</button>
                <button onClick={() => openUserRoute("/account/orders/current")}>
                  Current Orders
                </button>
                <button onClick={() => openUserRoute("/account/orders/history")}>
                  Order History
                </button>
                <button onClick={() => openUserRoute("/account/addresses")}>
                  Address Book
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout?.();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button className="blinkit-login-btn" onClick={handleAuthClick}>
            Login
          </button>
        )}
      </div>

      <div className={`hamburger ${isMobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </header>
  );
};

export default Navbar;

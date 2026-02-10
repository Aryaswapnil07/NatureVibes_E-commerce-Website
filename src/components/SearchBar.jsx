import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Leaf } from "lucide-react";
import { categories, furniture } from "../data.js"; 
import "../components/css/SearchBar.css";

const SearchBar = ({ placeholder }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null); // Ref to focus input

  // 1. Flatten Data (Optimized)
  const allProducts = useMemo(() => {
    let items = [];
    
    // Extract Plants
    if (categories && typeof categories === 'object') {
      const extracted = Object.values(categories).flatMap(cat => cat.products || []);
      items = [...items, ...extracted];
    } else if (Array.isArray(categories)) {
      items = [...items, ...categories];
    }

    // Extract Furniture
    if (furniture) {
      if (Array.isArray(furniture)) {
         items = [...items, ...furniture];
      } else if (furniture.products) {
         items = [...items, ...furniture.products];
      }
    }
    return items;
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.length === 0) return;

    const filtered = allProducts.filter((item) => {
      if (!item || !item.name) return false;
      return (
        item.name.toLowerCase().includes(lowerQuery) ||
        (item.category && item.category.toLowerCase().includes(lowerQuery))
      );
    }).slice(0, 6);

    setSuggestions(filtered);
    // Don't auto-show dropdown if query is empty
    if (filtered.length > 0) setShowDropdown(true);

  }, [query, allProducts]);

  // 3. ✅ NEW: Click Outside to Close (Disappear)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false); // Hides dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Navigation Handler
  const handleSelectProduct = (product) => {
    setQuery(""); // Clear input
    setShowDropdown(false); // Hide dropdown
    navigate(`/product/${product.id}`, { state: { product } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. ✅ NEW: Handle "Enter" Key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (suggestions.length > 0) {
        // Go to the first suggestion
        handleSelectProduct(suggestions[0]);
      } else {
        // Optional: Navigate to a "Search Results" page if you had one
        console.log("No specific product match, searching generally...");
      }
    }
  };

  // 6. ✅ NEW: Handle Magnifying Glass Click
  const handleSearchClick = () => {
    if (query.trim() !== "" && suggestions.length > 0) {
      handleSelectProduct(suggestions[0]);
    } else {
      inputRef.current.focus(); // Just focus if empty
      if (query.length > 0) setShowDropdown(true);
    }
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-input-container">
        {/* ✅ Clickable Search Icon */}
        <Search 
          className="search-icon clickable-icon" 
          size={18} 
          onClick={handleSearchClick}
        />
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Search..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} // ✅ Listens for Enter
          onFocus={() => {
            if (query.length > 0) setShowDropdown(true);
          }}
        />
        
        {query && (
          <X 
            className="clear-icon" 
            size={18} 
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowDropdown(false);
              inputRef.current.focus();
            }} 
          />
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {suggestions.length > 0 ? (
            suggestions.map((product) => (
              <div
                key={product.id || Math.random()} 
                className="suggestion-item"
                onClick={() => handleSelectProduct(product)}
              >
                {product.image ? (
                   <img src={product.image} alt={product.name} className="suggest-img" />
                ) : (
                   <div className="suggest-img-placeholder">🌱</div>
                )}
                
                <div className="suggest-info">
                  <span className="suggest-name">{product.name}</span>
                  <span className="suggest-cat">{product.category}</span>
                </div>
                <Leaf size={14} className="suggest-leaf" />
              </div>
            ))
          ) : (
            <div className="no-result">No plants found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
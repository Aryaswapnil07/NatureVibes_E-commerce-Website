import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Leaf } from "lucide-react";
import "../components/css/SearchBar.css";

const SearchBar = ({ placeholder, products = [] }) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const allProducts = useMemo(
    () => products.filter((item) => item && item.id && item.name),
    [products]
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();
    return allProducts
      .filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          String(item.category || "")
            .toLowerCase()
            .includes(lowerQuery)
      )
      .slice(0, 6);
  }, [query, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setQuery("");
    setShowDropdown(false);
    navigate(`/product/${product.id}`, { state: { product } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (suggestions.length > 0) {
      handleSelectProduct(suggestions[0]);
    }
  };

  const handleSearchClick = () => {
    if (query.trim() && suggestions.length > 0) {
      handleSelectProduct(suggestions[0]);
      return;
    }
    inputRef.current?.focus();
    if (query.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-input-container">
        <Search className="search-icon clickable-icon" size={18} onClick={handleSearchClick} />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Search..."}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowDropdown(event.target.value.trim().length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length > 0) {
              setShowDropdown(true);
            }
          }}
        />

        {query ? (
          <X
            className="clear-icon"
            size={18}
            onClick={() => {
              setQuery("");
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
          />
        ) : null}
      </div>

      {showDropdown ? (
        <div className="search-dropdown">
          {suggestions.length > 0 ? (
            suggestions.map((product) => (
              <div
                key={product.id}
                className="suggestion-item"
                onClick={() => handleSelectProduct(product)}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="suggest-img" />
                ) : (
                  <div className="suggest-img-placeholder">PLT</div>
                )}

                <div className="suggest-info">
                  <span className="suggest-name">{product.name}</span>
                  <span className="suggest-cat">{product.category}</span>
                </div>
                <Leaf size={14} className="suggest-leaf" />
              </div>
            ))
          ) : (
            <div className="no-result">No products found for "{query}"</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;

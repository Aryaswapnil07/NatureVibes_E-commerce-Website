import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose }) => {
  // State to toggle between Login and Sign Up views
  const [isLoginView, setIsLoginView] = useState(true);

  // If the modal is not open, do not render anything
  if (!isOpen) return null;

  // Helper to switch modes and clear inputs if needed
  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      
      {/* Stop click propagation so clicking inside the box doesn't close the modal */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        
        <span className="close-modal" onClick={onClose}>&times;</span>
        
        <h2>{isLoginView ? "Welcome Back" : "Create Account"}</h2>
        <p className="modal-subtitle">
          {isLoginView ? "Login to access your garden" : "Join our community of plant lovers"}
        </p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Show Name field only for Sign Up */}
          {!isLoginView && (
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Full Name" 
              required 
            />
          )}
          
          <input type="email" className="modal-input" placeholder="Email Address" required />
          <input type="password" className="modal-input" placeholder="Password" required />
          
          <button type="submit" className="btn-login-submit">
            {isLoginView ? "Log In" : "Sign Up"}
          </button>
        </form>
        
        <div className="modal-divider">or</div>
        
        <button className="google-btn">
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Logo" 
            style={{width:'20px', height:'20px'}}
          />
          {isLoginView ? "Sign in with Google" : "Sign up with Google"}
        </button>

        {/* --- Toggle between Login and Sign Up --- */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          {isLoginView ? (
            <p>
              New to NatureVibes?{" "}
              <span 
                onClick={toggleView} 
                style={{ color: 'var(--green, #28a745)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span 
                onClick={toggleView} 
                style={{ color: 'var(--green, #28a745)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Log In
              </span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginModal;  
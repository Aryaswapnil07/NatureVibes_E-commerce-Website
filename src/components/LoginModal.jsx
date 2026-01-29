import React from 'react';

const LoginModal = ({ isOpen, onClose }) => {
  // If the modal is not open, do not render anything
  if (!isOpen) return null;

  return (
    // The overlay covers the whole screen. We add inline style display:flex to override the CSS display:none
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      
      {/* Stop click propagation so clicking inside the box doesn't close the modal */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        
        <span className="close-modal" onClick={onClose}>&times;</span>
        
        <h2>Welcome Back</h2>
        <p className="modal-subtitle">Login to access your garden</p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" className="modal-input" placeholder="Email Address" required />
          <input type="password" className="modal-input" placeholder="Password" required />
          <button type="submit" className="btn-login-submit">Log In</button>
        </form>
        
        <div className="modal-divider">or</div>
        
        <button className="google-btn">
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Logo" 
            style={{width:'20px', height:'20px'}}
          />
          Sign in with Google
        </button>

      </div>
    </div>
  );
};

export default LoginModal;
import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Home, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      {/* Animated Plant Icon */}
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ 
          rotate: [0, -10, 10, -5, 0],
          opacity: 1 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatType: "mirror" 
        }}
      >
        <Leaf size={120} color="#4CAF50" strokeWidth={1.5} />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={styles.title}
      >
        404
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={styles.text}
      >
        Oops! This leaf has withered away. <br />
        The page you are looking for doesn't exist in our garden.
      </motion.p>

      <div style={styles.buttonGroup}>
        <Link to="/" style={styles.button}>
          <Home size={18} style={{ marginRight: '8px' }} />
          Back to Greenhouse
        </Link>
        
        <button 
          onClick={() => window.location.reload()} 
          style={{ ...styles.button, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
        >
          <RefreshCcw size={18} style={{ marginRight: '8px' }} />
          Try Again
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, sans-serif',
    padding: '20px',
  },
  title: {
    fontSize: '6rem',
    margin: '10px 0',
    color: '#064e3b',
    fontWeight: '800',
  },
  text: {
    fontSize: '1.2rem',
    color: '#374151',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: '600',
    backgroundColor: '#10b981',
    color: 'white',
    transition: 'transform 0.2s',
    border: 'none',
    cursor: 'pointer',
  }
};

export default NotFound;
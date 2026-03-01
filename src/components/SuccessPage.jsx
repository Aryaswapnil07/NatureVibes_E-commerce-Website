import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti'; // Optional: npm install canvas-confetti
import "../components/css/SuccessPage.css";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Trigger Nature-themed Confetti (Greens and Golds)
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2e7d32', '#a47551', '#ffffff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2e7d32', '#a47551', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="success-page-wrapper">
      <div className="success-card">
        <div className="success-icon-wrap">
          <CheckCircle size={80} className="main-success-icon" />
        </div>
        
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-msg">
          Thank you for choosing <strong>NatureVibes</strong>. Your new green companions are being prepared for their journey to your home.
        </p>

        <div className="order-details-mini">
          <div className="detail-item">
            <Package size={20} />
            <span>
              {order?.orderNumber
                ? `Order ID: ${order.orderNumber}`
                : "Estimated Delivery: 3-5 Business Days"}
            </span>
          </div>
        </div>

        <div className="success-actions">
          <button className="btn-home" onClick={() => navigate('/')}>
            <Home size={18} /> Back to Home
          </button>
          <button className="btn-track" onClick={() => navigate('/')}>
            Track Order <ArrowRight size={18} />
          </button>
        </div>
        
        <p className="support-text">A confirmation email has been sent to your inbox.</p>
      </div>
    </div>
  );
};

export default SuccessPage;

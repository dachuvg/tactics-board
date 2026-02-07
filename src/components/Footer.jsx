import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-left">
            Tactics Board v1.0
        </span>

        <span className="footer-center">
          Feel free to reach out with feedback or suggestions! <a href="https://x.com/stat_padder_" target="_blank" rel="noopener noreferrer">DM me on X</a>
        </span>

        <span className="footer-right">
          Developed by <a href="https://x.com/stat_padder_" target="_blank" rel="noopener noreferrer">DV</a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;

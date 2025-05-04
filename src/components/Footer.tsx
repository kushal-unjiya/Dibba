import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <Link to="/about" className="px-3 hover:text-white">About Us</Link>
          <Link to="/terms" className="px-3 hover:text-white">Terms & Conditions</Link>
          <Link to="/privacy" className="px-3 hover:text-white">Privacy Policy</Link>
          <Link to="/contact" className="px-3 hover:text-white">Contact</Link>
        </div>
        <div className="mb-4">
          {/* Add Social Media Icons here */}
          <span className="px-2">FB</span>
          <span className="px-2">IG</span>
          <span className="px-2">TW</span>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} Dibba: Swad Ghar Ka. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
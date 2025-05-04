import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">Oops! The page you are looking for does not exist.</p>
      <Link
        to="/" // Link to the homepage or role selector
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
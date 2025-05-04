import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundProps {
  message?: string;
  showHomeLink?: boolean;
  customAction?: {
    label: string;
    onClick: () => void;
  };
}

const NotFound: React.FC<NotFoundProps> = ({
  message = 'Page not found',
  showHomeLink = true,
  customAction
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">404</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="space-y-3">
          {showHomeLink && (
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200"
            >
              Return to Home
            </Link>
          )}
          
          {customAction && (
            <button
              onClick={customAction.onClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {customAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
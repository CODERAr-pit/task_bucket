import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-bg-primary border-t border-border-primary mt-auto">
      <div className="max-w-[1700px] mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="border-l-4 border-blue-500 pl-4 mb-6">
          <h2 className="text-text-heading font-bold text-xl">
            Entrepreneurship Development Cell
          </h2>
          <p className="text-text-muted text-sm mt-1">NIT Durgapur</p>
        </div>
        
        <div className="space-y-3">
          <p className="text-text-body text-sm leading-relaxed">
            Made with <span className="text-red-500">❤</span> by{' '}
            <a 
              href="#" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Web-Team
            </a>
          </p>
          <p className="text-text-muted text-xs">
            © 2025 EDC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

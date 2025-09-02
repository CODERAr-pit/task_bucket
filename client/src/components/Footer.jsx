import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">

                <div className="border-l-4 border-primary pl-4 mb-6">
                    <h2 className="text-text-primary font-bold text-xl">
                        Entrepreneurship Development Cell
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">NIT Durgapur</p>
                </div>

                <div className="space-y-2">
                    <p className="text-text-secondary text-sm">
                        Made with <span className="text-primary">❤</span> by the{' '}
                        <a
                            href="#"
                            className="font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            Web Team
                        </a>
                    </p>
                    <p className="text-text-secondary/70 text-xs">
                        © 2025 EDC. All Rights Reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
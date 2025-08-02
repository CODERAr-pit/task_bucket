import React from "react";
import { useTaskContext } from "../context/TaskContext";

const Navbar = () => {
    const { selectedDomain, setSelectedDomain, domains } = useTaskContext();

    console.log('Navbar render - selectedDomain:', selectedDomain);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-full mx-auto px-6 py-4">
                <div className="flex items-center justify-between gap-8">
                    {/* Logo/Title Section */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <img src={"../edc.svg"} alt="logo" className="h-8 w-auto" />
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Task Dashboard
                        </h1>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedDomain === 'General'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => {
                                console.log('General button clicked');
                                setSelectedDomain('General');
                            }}
                        >
                            General
                        </button>

                        {domains.map((domain, index) => {
                            const colors = [
                                'bg-green-100 text-green-700 border-green-200', // Web Development
                                'bg-purple-100 text-purple-700 border-purple-200', // Content Writing
                                'bg-pink-100 text-pink-700 border-pink-200', // Graphic Designing
                                'bg-orange-100 text-orange-700 border-orange-200' // Video Editing
                            ];

                            const hoverColors = [
                                'hover:bg-green-50',
                                'hover:bg-purple-50',
                                'hover:bg-pink-50',
                                'hover:bg-orange-50'
                            ];

                            return (
                                <button
                                    key={domain}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                                        selectedDomain === domain
                                            ? colors[index]
                                            : `bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 ${hoverColors[index]}`
                                    }`}
                                    onClick={() => {
                                        console.log('Domain button clicked:', domain);
                                        setSelectedDomain(domain);
                                    }}
                                >
                                    {domain}
                                </button>
                            );
                        })}
                    </div>

                    {/* Profile Section */}
                    <div className="flex-shrink-0">
                        <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 transition-colors duration-200">
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
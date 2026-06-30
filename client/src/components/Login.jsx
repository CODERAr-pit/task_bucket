import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(loginData)
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userData', JSON.stringify(data.user));

                if (data.user.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Invalid email or password.');
            }
        } catch (err) {
            setError(`Network error. Please try again.${err}`);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background grid lg:grid-cols-2 font-sans">

            {/* Left Panel: Brand & Visuals */}
            <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-surface border-r border-border">
                <div className="text-center max-w-md">
                    <img
                        src="/image2.png"
                        alt="Company Logo"
                        className="h-48 w-auto mx-auto mb-8"
                    />
                    <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
                        Ideate, Innovate, Incubate.
                    </h1>
                    <p className="text-text-secondary mt-4 text-lg">
                        The Task Management Portal
                    </p>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-sm">
                    {/* Mobile-only Header */}
                    <div className="text-center mb-8 lg:hidden">
                        <img src="/image2.png" alt="Company Logo" className="h-24 w-auto mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
                        <p className="text-text-secondary mt-2">Sign in to continue.</p>
                    </div>

                    {/* Desktop-only Header */}
                    <div className="text-center mb-10 hidden lg:block">
                        <h1 className="text-3xl font-bold text-text-primary">Sign In</h1>
                        <p className="text-text-secondary mt-2">Enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-800/40 border border-red-700/50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-300 font-medium text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-3"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-border text-center">
                        <p className="text-text-secondary text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
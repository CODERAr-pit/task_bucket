import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Changed to react-router-dom for modern use

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
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userData', JSON.stringify(data.user));

                console.log('Login successful:', data);

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
            setError('Network error. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 grid lg:grid-cols-2">

            {/* Left Panel: Brand & Visuals */}
            <div className="hidden lg:flex items-center justify-center p-12 bg-neutral-800">
                <div className="text-center">
                    <div className="mb-8">
                        <img
                            src="/image2.png"
                            alt="EDC Logo"
                            className="h-48 w-auto mx-auto mb-4"
                        />
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            Ideate, Innovate, Incubate.
                        </h1>
                        <p className="text-neutral-400 mt-2 text-lg">
                            Task management Portal
                        </p>
                    </div>
                    {/* Add a subtle graphic or animation here */}
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white rounded-l-2xl shadow-2xl z-10">
                <div className="w-full max-w-sm">

                    {/* Mobile Header (for smaller screens) */}
                    <div className="lg:hidden text-center mb-10">
                        <img src="/edc.svg" alt="EDC Logo" className="h-12 w-auto mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-neutral-800">Welcome Back</h1>
                        <p className="text-neutral-500 mt-1">Sign in to your account</p>
                    </div>

                    {/* Form Section */}
                    {error && (
                        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-rose-700 font-medium text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-neutral-700"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-neutral-800 placeholder:text-neutral-400 shadow-sm"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-neutral-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-neutral-800 placeholder:text-neutral-400 shadow-sm"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:ring-4 focus:ring-emerald-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>Sign In</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                        <div className="space-x-2">
                            <p className="text-neutral-600 text-sm inline">
                                Don't have an account?
                            </p>
                            <Link
                                to="/signup"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors duration-250"
                            >
                                Create Account
                            </Link>
                        </div>
                        <div className="mt-4">
                            <p className="text-neutral-500 text-sm">
                                Need help? Contact{' '}
                                <a href="mailto:support@edc.com" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-250">
                                    EDC Support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
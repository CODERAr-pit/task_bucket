import { useState } from 'react';
import { Link } from 'react-router-dom';

const SignIn = ({ onSignInSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        number: '',
        role: '',
        domain: '',
        password: '',
        passwordConfirm: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validation
        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.number ||
            !formData.role ||
            !formData.domain ||
            !formData.password
        ) {
            alert('Please fill in all fields!');
            setIsSubmitting(false);
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert('Passwords do not match!');
            setIsSubmitting(false);
            return;
        }

        try {
            const registrationData = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                domain: formData.domain,
                number: formData.number
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(registrationData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Registration successful:', data);
                alert('Registration successful!');
                onSignInSuccess && onSignInSuccess();
            } else {
                const error = await res.json();
                alert(error.message || 'Registration failed!');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed! Please try again.');
        } finally {
            setIsSubmitting(false);
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
                            Join Our Community.
                        </h1>
                        <p className="text-neutral-400 mt-2 text-lg">
                            Start assigning tasks and collaborating with your team today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Sign Up Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white rounded-l-2xl shadow-2xl z-10">
                <div className="w-full max-w-sm">

                    {/* Mobile Header (for smaller screens) */}
                    <div className="lg:hidden text-center mb-10">
                        <img src="/edc.svg" alt="EDC Logo" className="h-12 w-auto mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-neutral-800">Create Your Account</h1>
                        <p className="text-neutral-500 mt-1">Get started in just a few steps.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="number" className="block text-sm font-semibold text-neutral-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="number"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-neutral-700 mb-1">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="domain" className="block text-sm font-semibold text-neutral-700 mb-1">Domain</label>
                            <select
                                id="domain"
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                required
                            >
                                <option value="">Select Domain</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Video Editing">Video Editing</option>
                                <option value="Graphic Designing">Graphic Designing</option>
                                <option value="Content Writing">Content Writing</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-neutral-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-800 shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                        <div className="space-x-2">
                            <p className="text-neutral-600 text-sm inline">
                                Already have an account?
                            </p>
                            <Link
                                to="/"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors duration-250"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        number: '',
        role: '',
        domains: [],
        password: '',
        passwordConfirm: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleDomainToggle = (domainName) => {
        setFormData((prevData) => {
            const isSelected = prevData.domains.includes(domainName);
            return {
                ...prevData,
                domains: isSelected
                    ? prevData.domains.filter((d) => d !== domainName)
                    : [...prevData.domains, domainName],
            };
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validation
        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.number ||
            !formData.role ||
            !formData.domains.length ||
            !formData.password
        ) {
            setError('Please fill in all fields and select at least one domain.');
            setIsSubmitting(false);
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match.');
            setIsSubmitting(false);
            return;
        }

        try {
            const registrationData = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                domains: formData.domains,
                domain: formData.domains[0],
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
                navigate('/login');
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Registration failed.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
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
                <div className="w-full max-w-lg">

                    {/* Mobile Header (for smaller screens) */}
                    <div className="lg:hidden text-center mb-10">
                        <img src="/edc.svg" alt="EDC Logo" className="h-12 w-auto mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-neutral-800">Create Your Account</h1>
                        <p className="text-neutral-500 mt-1">Get started in just a few steps.</p>
                    </div>

                    {/* Error Message */}
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
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Domains (Select multiple)</label>
                            <div className="space-y-2">
                                <p className="text-xs text-neutral-500">Select all domains you're interested in or have skills in:</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Web Development', 'Video Editing', 'Graphic Designing', 'Content Writing'].map((domain) => (
                                        <label key={domain} className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.domains.includes(domain)}
                                                onChange={() => handleDomainToggle(domain)}
                                                className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-600 focus:ring-2"
                                            />
                                            <span className="text-sm font-medium text-neutral-700">{domain}</span>
                                        </label>
                                    ))}
                                </div>
                                {formData.domains.length > 0 && (
                                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-sm text-emerald-800">
                                            <strong>Selected:</strong> {formData.domains.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
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
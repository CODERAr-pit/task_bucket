import { useState } from 'react';

const SignIn = ({ onSignInSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    number: '',
    role: '',
    domains: [], // Changed from 'domain' to 'domains' array
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
        !formData.domains.length || // Changed validation for domains array
        !formData.password
    ) {
      alert('Please fill in all fields and select at least one domain!');
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
        domains: formData.domains, // Send domains array
        domain: formData.domains[0], // Keep first domain for backward compatibility
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
    <div className="w-full max-w-[800px] px-4 py-12 mx-auto min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-xl mt-20 border border-white/80">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col w-full">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-black mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            <label htmlFor="domains" className="block text-sm font-medium text-black mb-2">Domains (Select multiple)</label>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 mb-3">Select all domains you're interested in or have skills in:</p>
              <div className="grid grid-cols-1 gap-2">
                {['Web Development', 'Video Editing', 'Graphic Designing', 'Content Writing'].map((domain) => (
                  <label key={domain} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.domains.includes(domain)}
                      onChange={() => handleDomainToggle(domain)}
                      className="w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-slate-900 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{domain}</span>
                  </label>
                ))}
              </div>
              {formData.domains.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {formData.domains.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

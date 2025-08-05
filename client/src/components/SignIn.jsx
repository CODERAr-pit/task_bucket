import { useState } from 'react';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert('Passwords do not match!');
      return;
    }

    const res = await fetch('http://localhost:8090/api/collections/users/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('userData', JSON.stringify(data));
      onSignInSuccess();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.record));
      console.log('Sign in successful:', data);
      alert('Sign in successful!');
    
    } else {
      alert('Sign in failed!');
    }

    if (
        !formData.name ||
        !formData.lastName ||
        !formData.email ||
        !formData.number ||
        !formData.role ||
        !formData.domain ||
        !formData.password
    ) {
      alert('Please fill in all fields!');
      return;
    }

    localStorage.setItem('userData', JSON.stringify(formData));
    onSignInSuccess();
  };


  return (
    <div className="w-full max-w-[800px] px-4 py-12 mx-auto min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-xl border border-white/80">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Sign In</h2>
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

          <div>
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

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter your contact number"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <select
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            >
              <option value="">Select Domain</option>
              <option value="Web Development">Web Development</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Graphic Designing">Graphic Designing</option>
              <option value="Content Writing">Content Writing</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="text"
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
                type="text"
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
            className="w-full mt-4 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

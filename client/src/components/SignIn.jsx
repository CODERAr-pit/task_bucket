import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: "",
    domains: [],
    password: "",
    passwordConfirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time password validation
    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    }

    if (error) setError("");
    if (validationErrors.length > 0) setValidationErrors([]);
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
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.number ||
      !formData.role ||
      !formData.domains.length ||
      !formData.password
    ) {
      setError("Please fill in all fields and select at least one domain.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match.");
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
        number: formData.number,
      };

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registrationData),
      });

      if (res.ok) {
        alert("Registration successful! Please sign in.");
        navigate("/");
      } else {
        const errorData = await res.json();
        if (errorData.errors && errorData.errors.length > 0) {
          setValidationErrors(errorData.errors);
          setError("Please fix the validation errors below.");
        } else {
          setError(errorData.message || "Registration failed.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const domainOptions = [
    "Web Development",
    "Video Editing",
    "Graphic Designing",
    "Content Writing",
  ];

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
            Join Our Community.
          </h1>
          <p className="text-text-secondary mt-4 text-lg">
            Start assigning tasks and collaborating with your team today.
          </p>
        </div>
      </div>

      {/* Right Panel: Sign Up Form */}
      <div className="flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Mobile-only Header */}
          <div className="text-center mb-8 lg:hidden">
            <img
              src="/image2.png"
              alt="Company Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-text-primary">
              Create Account
            </h1>
            <p className="text-text-secondary mt-2">
              Get started in just a few steps.
            </p>
          </div>

          {/* Desktop-only Header */}
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold text-text-primary">
              Create an Account
            </h1>
            <p className="text-text-secondary mt-2">
              Fill out the form to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="number"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Select your role...</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Domains
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {domainOptions.map((domain) => (
                  <label
                    key={domain}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.domains.includes(domain)
                        ? "bg-primary/10 border-primary/20"
                        : "border-border hover:bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.domains.includes(domain)}
                      onChange={() => handleDomainToggle(domain)}
                      className="w-4 h-4 text-primary bg-surface border-border rounded-sm focus:ring-primary focus:ring-offset-background"
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.domains.includes(domain)
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {domain}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />

                {/* Real-time Password Validation Feedback */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-surface/50 border border-border rounded-lg">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Password Requirements:
                    </p>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center text-xs ${
                          passwordValidation.length
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <span className="mr-2">
                          {passwordValidation.length ? "✓" : "✗"}
                        </span>
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordValidation.uppercase
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <span className="mr-2">
                          {passwordValidation.uppercase ? "✓" : "✗"}
                        </span>
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordValidation.lowercase
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <span className="mr-2">
                          {passwordValidation.lowercase ? "✓" : "✗"}
                        </span>
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordValidation.number
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <span className="mr-2">
                          {passwordValidation.number ? "✓" : "✗"}
                        </span>
                        <span>One number (0-9)</span>
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordValidation.special
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <span className="mr-2">
                          {passwordValidation.special ? "✓" : "✗"}
                        </span>
                        <span>One special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />

                {/* Password Match Feedback */}
                {formData.passwordConfirm && (
                  <div className="mt-2">
                    <div
                      className={`flex items-center text-xs ${
                        formData.password === formData.passwordConfirm
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-2">
                        {formData.password === formData.passwordConfirm
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>
                        {formData.password === formData.passwordConfirm
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Display Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-semibold text-sm mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className="text-red-700 text-sm flex items-start"
                    >
                      <span className="mr-2 text-red-500">•</span>
                      <span>
                        <strong>{error.path}:</strong> {error.msg}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display General Error */}
            {error && !validationErrors.length && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-3"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-text-secondary text-sm">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

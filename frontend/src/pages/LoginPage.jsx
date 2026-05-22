import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { Button, Input, showToast } from '../components/common/CommonComponents';
import { getErrorMessage } from '../utils/helpers';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuthStore(); // 👈 add loginAsGuest

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // 👇 new handler
  const handleGuestLogin = () => {
    loginAsGuest();
    showToast.success('Continuing as Guest');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Study Assistant
          </h1>
          <p className="text-gray-600">Welcome back! Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </form>

        {/* 👇 Divider + Guest Button */}
        <div className="mt-4 flex items-center gap-3">
          <hr className="flex-1 border-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <button
          onClick={handleGuestLogin}
          className="mt-4 w-full py-2 px-4 border-2 border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          👋 Continue as Guest
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
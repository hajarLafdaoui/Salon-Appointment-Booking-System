import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import heroImage from '../../assets/images/2.jpg';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Loader from '../../components/ui/Loader';
import './Auth.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [postLoginLoading, setPostLoginLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the destination and message from state
    const from = location.state?.from || null;
    const redirectMessage = location.state?.message || null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Login failed');
                    setLoading(false);
                    return;
                }

                login({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role
                }, data.token);

                setPostLoginLoading(true);

                setTimeout(() => {
                    if (from) {
                        navigate(from);
                    } else if (data.role === 'staff') {
                        navigate('/staff/dashboard');
                    } else if (data.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 2000);
            } else {
                // Register
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        role: 'customer'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Registration failed');
                    setLoading(false);
                    return;
                }

                // Switch to login mode instead of redirecting
                setFormData({
                    name: '',
                    email: formData.email,
                    password: '',
                    confirmPassword: ''
                });
                setIsLogin(true);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (postLoginLoading) {
        return <Loader message="Welcome back! Taking you to your dashboard..." />;
    }

    return (
        <div className="auth-wrapper">
            <Navbar />
            <div className="login-container">
                <div className="login-left">
                    <div className="login-image-wrapper">
                        <img src={heroImage} alt="BeautyGlow" className="login-image" />
                        <div className="login-overlay">
                            <div className="overlay-bottom-right">
                                <h3 className="overlay-quote-title">BeautyGlow</h3>
                                <p className="overlay-quote">"Transform Your Beauty Routine"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-form-wrapper">
                        <div className="login-header">
                            <h1 className="login-title">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="login-subtitle">
                                {isLogin
                                    ? 'Access your personalized beauty experience and manage your appointments effortlessly'
                                    : 'Join us for easy beauty bookings and exclusive offers'
                                }
                            </p>
                        </div>

                        {redirectMessage && <div className="auth-message">{redirectMessage}</div>}
                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="login-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                </div>
                            )}

                            <div className="form-group">
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="email" className="form-label">Email</label>
                            </div>

                            <div className="form-group">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="password" className="form-label">Password</label>
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                </div>
                            )}

                            {isLogin && (
                                <div className="form-options">
                                    <label className="remember-me">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="/forgot-password" className="forgot-password">Forgot password?</a>
                                </div>
                            )}

                            <button type="submit" className="login-button" disabled={loading}>
                                {loading
                                    ? (isLogin ? 'Signing in...' : 'Creating account...')
                                    : (isLogin ? 'Log In' : 'Sign Up')
                                }
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>
                                {isLogin
                                    ? "Don't have an account? "
                                    : 'Already have an account? '
                                }
                                <button
                                    type="button"
                                    className="toggle-auth-link"
                                    onClick={handleToggle}
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to send reset email');
                setLoading(false);
                return;
            }

            setMessage('Password reset link has been sent to your email');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Side - Image with Text Overlay */}
            <div className="login-left">
                <div className="login-image-wrapper">
                    <img src={require('../../assets/images/7.jpg')} alt="BeautyGlow" className="login-image" />
                    <div className="login-overlay">
                        <div className="overlay-bottom-right">
                            <h3 className="overlay-quote-title">BeautyGlow</h3>
                            <p className="overlay-quote">"Transform Your Beauty Routine"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="login-right">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h1 className="login-title">Reset Password</h1>
                        <p className="login-subtitle">Enter your email to receive a password reset link</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label htmlFor="email" className="form-label">Email</label>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Remember your password? <Link to="/login" className="signup-link">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

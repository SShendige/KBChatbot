import React, { useState } from 'react';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <h1 className="logo-title">Knowledge Base Chat</h1>
                    </div>
                    <p className="login-subtitle">
                        Upload documents and chat with your knowledge base
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        label="Email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {!isLogin && (
                        <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    )}

                    {error && <div className="login-error">{error}</div>}

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="login-button"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>

                    <div className="login-toggle">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            className="toggle-link"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

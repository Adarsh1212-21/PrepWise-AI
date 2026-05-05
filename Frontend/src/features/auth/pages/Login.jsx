import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleLogin({ email, password })
        if (success) navigate('/')
    }

    if (loading) return <main className='auth-loading'><h1>Loading...</h1></main>

    return (
        <main className='auth-page'>
 <div className="auth-container">
            {/* Left Panel */}
            <div className='auth-left'>
                <div className='auth-left__logo'>
                    
                        <img 
  src="/main_icon.svg" 
  alt="Prepwise AI" 
  width={25} 
  height={25} 
/>
                    
                    AI Interview Coach
                </div>
                <div className='auth-left__hero'>
                    <h1>Ace Every <span className='highlight'>Interview</span> with AI</h1>
                    <p>Personalized preparation. Smart feedback.<br />Better opportunities.</p>
                </div>
                <div className='auth-left__cards'>
                    <div className='preview-card preview-card--resume'>
                        <div className='preview-card__avatar'></div>
                        <div className='preview-card__lines'>
                            <span /><span /><span /><span />
                        </div>
                    </div>
                    <div className='preview-card preview-card--score'>
                        <div className='score-ring'>
                            <span className='score-ring__value'>85<sub>%</sub></span>
                            <span className='score-ring__label'>Match Score</span>
                        </div>
                    </div>
                    <div className='preview-card preview-card--feedback'>
                        <div className='feedback-icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/></svg>
                        </div>
                        <div>
                            <p className='feedback-title'>AI Feedback</p>
                            <p className='feedback-text'>Great! You have strong problem solving skills. Focus on system design questions.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className='auth-right'>
                <div className='auth-form-wrap'>
                    <h2>Welcome Back</h2>
                    <p className='auth-subtitle'>Login to continue to your account</p>

                    <form onSubmit={handleSubmit} className='auth-form'>
                        <div className='input-group'>
                            <label htmlFor='email'>Email address</label>
                            <div className='input-wrap'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    type='email' id='email' placeholder='Enter your email' />
                            </div>
                        </div>

                        <div className='input-group'>
                            <label htmlFor='password'>Password</label>
                            <div className='input-wrap'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? 'text' : 'password'} id='password' placeholder='Enter your password' />
                                <button type='button' className='eye-btn' onClick={() => setShowPassword(s => !s)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                            </div>
                            
                        </div>

                        <button type='submit' className='auth-btn'>Login →</button>
                    </form>

                   

                    <p className='auth-switch'>Don't have an account? <Link to='/register'>Sign up</Link></p>
                </div>
                </div>
            </div>
        </main>
    )
}

export default Login
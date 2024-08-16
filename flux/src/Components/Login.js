import './Login.css';
import bgImage from '../assets/bg.jpg';
import { useNavigate } from 'react-router-dom';

import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ }) {
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', formData);
            if (response.data.token) {
                // Save token to localStorage
                localStorage.setItem('authToken', response.data.token);

                // setIsLoggedIn(true);

                // Show success message
                toast.success("You've successfully logged in!");
    
                // Log success for debugging
                console.log('Logged in:', response.data);

                setFadeOut(true);

                setTimeout(() => {
                    navigate('/home/card');
                }, 3000);
            } else {
                throw new Error('Token not received from server');
            }
        } catch (error) {
            toast.error('There was an error logging into your account!');
            console.error('Error logging in:', error);
        }
    };

    return (
        
        <div className={`login ${fadeOut ? 'fade-out' : ''}`} style={{ 
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}><ToastContainer/>
            <div className='login-inner py-4 px-3 d-flex flex-column text-center align-items-center justify-content-center'>
                <div>
                    <h3 className="heading-font pb-3 text-black">Log in</h3>
                        <form className="receipt-inputs px-3 " onSubmit={handleSubmit}>
                        <div className="py-2">
                            <input
                                className="py-1 px-2 form-control"
                                type="text"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="py-2">
                            <input
                                className="py-1 px-2 form-control"
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-center pt-3">
                            <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3 normal-btn">Log In</button>
                        </div>
                        <div className='pt-3'>
                            <p className='m-0 text-black heading-font'>Not a user?<span 
                                className='px-1'
                                onClick={() => navigate('/register')}
                                style={{ cursor: 'pointer', color: 'blue' }}
                            > Sign Up</span></p>
                        </div>
                    </form>
                </div>
            </div>
            
        </div>
        
    );
}

export default Login;
import bgImage from '../assets/bg.jpg';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate(); // Move this to the start of the component

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organization: '',
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
            const response = await axios.post('/api/signup', formData); 
            toast.success('Your account has been registered successfully! Please log in.');
            console.log('User created:', response.data);
            
            setFadeOut(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error('There was an error registering your account!');
            console.error('Error creating user:', error);
        }
    };

    return (
        <div className={`register ${fadeOut ? 'fade-out' : ''}`} style={{ 
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}><ToastContainer/>
            <div className='register-inner py-4 px-3 d-flex flex-column text-center align-items-center justify-content-center'>
                <div>
                    <form className="receipt-inputs px-3 pt-1" onSubmit={handleSubmit}>
                        <h4 className="heading-font text-center pb-2 text-black">Sign Up</h4>
                        <div className="d-flex first-and-last py-2">
                            <input
                                className="py-1 px-2 form-control"
                                type="text"
                                placeholder="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <input
                                className="py-1 px-2 form-control"
                                type="text"
                                placeholder="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex first-and-last py-2">
                            <input
                                className="py-1 px-2 form-control"
                                type="text"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <input
                                className="py-1 px-2 form-control"
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="py-2 d-flex justify-content-center">
                            <input
                                className="py-1 px-2 form-control"
                                type="text"
                                placeholder="Organization Name"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-center pt-3">
                            <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3 normal-btn">Register</button>
                        </div>
                        <div className='pt-2'>
                            <p className='m-0 heading-font text-black'>Have an account?<span 
                                    className='px-1'
                                    onClick={() => navigate('/login')}
                                    style={{ cursor: 'pointer', color: 'blue' }}
                            > Log in</span></p>
                        </div>
                    </form>

                </div>
                
            </div>
        </div>
    )
}

export default Register;
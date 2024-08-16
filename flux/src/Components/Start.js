import './Start.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function Start(){
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        setFadeOut(true);
        setTimeout(() => {
            navigate('/register');
        }, 3000); 
    };

    const handleLoginClick = () => {
        setFadeOut(true);
        setTimeout(() => {
            navigate('/login');
        }, 3000); 
    };

    return (
        <div className={`bg-animation d-flex align-items-center justify-content-center ${fadeOut ? 'fade-out' : ''}`}>
            <div className='start py-2 px-3 d-flex text-center align-items-center justify-content-center'>
            <div>
                <h3 className="heading-font pb-3 text-black">Welcome to Flux</h3>
                <button 
                    className="normal-btn p-2 px-4" 
                    onClick={handleRegisterClick}
                >
                    Get started
                </button>
                <p className='pt-2 heading-font text-black'>
                    Already a user?   
                    <span className='px-1'
                        onClick={handleLoginClick}
                        style={{ cursor: 'pointer', color: 'blue' }}
                    >
                        Log in.
                    </span>
                </p>
            </div>
            </div>
            
        </div>
    )
}

export default Start;

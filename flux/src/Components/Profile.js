import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile({colors, userData, setUserData, fetchUserData}){

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }
    
            await axios.put('http://localhost:8000/api/user', userData, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });
    
            toast.success('Changes saved!');
        } catch (error) {
            toast.error('There was an error updating your account details!');
            console.error('Error updating user data:', error);
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault(); 
    
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to upload a profile image.');
                return;
            }
    
            if (!selectedFile) {
                toast.info('Please select a file to upload.');
                return;
            }
    
            const formData = new FormData();
            formData.append('file', selectedFile);
    
            await axios.post('http://localhost:8000/api/profile-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
    
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error('There was an error uploading your profile image!');
            console.error('Error uploading file:', error);
        }
    };    

    return(
        <div className="profile">
            <ToastContainer />
            <div className="profile-content p-2 new-font"
            style={{color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
            >
                    <h4 className="heading-font pb-2 text-center new-font">Settings</h4>
                    
                    <form className='receipt-inputs pt-1' onSubmit={handleSubmit}>
                        <div className='first-and-last d-flex'>
                            <div className='py-2'>
                                <p className="pb-2 m-0 profile-text new-font">First name</p>
                                <input
                                    className='px-2 form-control new-font'
                                    type="text"
                                    placeholder="First Name"
                                    name="firstName"
                                    value={userData.firstName || ''}
                                    onChange={handleChange}
                                    style={{color: colors.mainText, backgroundColor: colors.mainBackground}}
                                />
                            </div>
                            <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Last name</p>
                                <input
                                    className=' px-2 form-control'
                                    type="text"
                                    placeholder="Last Name"
                                    name="lastName"
                                    value={userData.lastName || ''}
                                    onChange={handleChange}
                                    style={{color: colors.mainText, backgroundColor: colors.mainBackground}}
                                />
                            </div>
                        </div>
                        <div className='first-and-last d-flex'>
                            <div className='py-2'>
                                <p className="pb-2 m-0 profile-text">Email</p>
                                <input
                                    className='px-2 form-control'
                                    type="text"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email || ''}
                                    onChange={handleChange}
                                    style={{color: colors.mainText, backgroundColor: colors.mainBackground}}
                                />
                            </div>
                            <div className='py-2'>
                                <p className="pb-2 m-0 profile-text">Password</p>
                                <input
                                    className='px-2 form-control'
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={userData.password || ''}
                                    onChange={handleChange}
                                    style={{color: colors.mainText, backgroundColor: colors.mainBackground}}
                                />
                            </div>
                        </div>
                        
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Organization name</p>
                            <input
                                className='px-2 form-control'
                                type="text"
                                placeholder="Organization Name"
                                name="organization"
                                value={userData.organization || ''}
                                onChange={handleChange}
                                style={{color: colors.mainText, backgroundColor: colors.mainBackground}}
                            />
                        </div>
                        <div className='py-3 d-flex flex-column align-items-center'>
                            <p className="pb-2 m-0 profile-text">Upload profile image</p>
                            <div className='d-flex first-and-last align-items-center'>
                                <div><input style={{color: colors.mainText, backgroundColor: colors.mainBackground}} type="file" className='profile-pic-upload-input' onChange={handleFileChange} /></div>
                                <button className='normal-btn' onClick={handleUpload}>Upload</button>
                            </div>
                        </div>
                        
                        <div className="text-center pt-4 pb-1">
                            <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3 normal-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
        </div>
    )
}

export default Profile;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Goals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Goals({colors, goals, setGoals, fetchGoals}) {
    
    const inputRefs = useRef([]); // Ref for focusing on the input field

    useEffect(() => {
        fetchGoals();
    }, []);

    // Save goals

    const saveGoals = async () => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.error('No token found');
                // toast.info('Please log in to save tasks.');
                return;
            }

            // Prepare goals data, no need to filter by 'completed' status
            const goalsToSave = goals.map(goal => ({
                text: goal.text,
                description: goal.description,
                completed: goal.completed,
            }));

            console.log('Goals to be saved:', goalsToSave);

            const response = await axios.post('/api/goals',
                { goals: goalsToSave }, // Ensure the key is 'goals' if that's what your backend expects
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Goals saved successfully:', response.data);
            toast.success('Changes saved');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Token is invalid or expired:', error);
                // toast.error('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else if (error.response && error.response.status === 404) {
                console.error('Route not found:', error);
                // toast.error('The requested resource was not found.');
            } else {
                console.error('Error saving goals:', error);
                // toast.error('There was an error saving your goals.');
            }
        }
    };

    const handleInputChange = (index, value) => {
        const updatedGoals = [...goals];
        updatedGoals[index].text = value;
        setGoals(updatedGoals);
    };

    const handleDescriptionChange = (index, value) => {
        const updatedGoals = [...goals];
        updatedGoals[index].description = value;
        setGoals(updatedGoals);
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission

            // Insert a new goal right after the current goal
            const newGoal = { text: '', description: '', completed: false};
            const updatedGoals = [
                ...goals.slice(0, index + 1),
                newGoal,
                ...goals.slice(index + 1)
            ];
            
            setGoals(updatedGoals);

            // Move the cursor to the newly created input
            setTimeout(() => {
                if (inputRefs.current[index + 1]) {
                    inputRefs.current[index + 1].focus();
                }
            }, 0);
        }
    };
    

    const handleAddGoal = () => {
        setGoals([...goals, { text: 'Add a goal', description: '', completed: false }]); // Add new goal with 'completed' set to false
        inputRefs.current.focus(); // Focus on the new input field
    };

    const handleDelete = (index) => {
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
    };

    const handleCheckboxChange = (index) => {
        const updatedGoals = [...goals];
        updatedGoals[index].completed = !updatedGoals[index].completed;
        setGoals(updatedGoals);
    };

    return (
        <div className="goals page">
            <ToastContainer />
            <h2 className='heading-font'>Goals</h2>
            <div className='goal-page-content'>
                <div className='goal-content pt-3'>
                    {goals.map((goal, index) => (
                        <div key={index} 
                        className='goal-item my-2 p-2 px-3'
                        style={{color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
                        >
                            <div className='d-flex justify-content-between'>
                                <div className='d-flex align-items-center'>
                                    <div className='task-checkbox-div pt-1'>
                                        <input
                                            type="checkbox"
                                            checked={goal.completed}
                                            onChange={() => handleCheckboxChange(index)}
                                            className="task-checkbox p-2"
                                        />
                                    </div>
                                    <div className='goal-input-div px-2'>
                                    <input
                                        ref={el => inputRefs.current[index] = el}
                                        // ref={inputRef}
                                        type="text"
                                        value={goal.text || ''}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`goal-input heading-font p-0 ${goal.completed ? 'completed' : ''}`}
                                        placeholder="Goal text"
                                        style={{color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
                                    />
                                    </div>
                                </div>
                                

                                <div className='goal-container-icons d-flex align-items-center first-and-last px-2 pt-1'>
                                    
                                    <div className='pb-2'>
                                        <div onClick={() => handleDelete(index)} className="px-2 board-delete-btn hover-icon p-1 goal-del-btn">
                                            <i className="fa-solid fa-trash"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='goal-textarea-container'>
                                <textarea
                                    value={goal.description || ''}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    placeholder="Goal description"
                                    className='goal-description-textarea'
                                    style={{color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
                                />
                            </div>
                            
                        </div>
                    ))}
                </div>
                <div className='pt-4'>
                    <button className='normal-btn' onClick={saveGoals}>Save Goals</button>
                </div>
            </div>
        </div>
    );
}

export default Goals;

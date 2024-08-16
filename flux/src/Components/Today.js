import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskItem from './TaskItem';
import CalendarView from './CalendarView';
import { useLocation } from 'react-router-dom';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import './Today.css';

function Today({ colors, tasks, setTasks, fetchTasks, getStatusColor, setCustomColors, customColors}) {
    // State to track tasks with completion status

    const [highlightedTaskId, setHighlightedTaskId] = useState(null);
    const [shouldSetView, setShouldSetView] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const taskId = query.get('highlighted');

        // Update highlighted task ID
        setHighlightedTaskId(taskId ? taskId : null);

        // Only set the view to 'board' if the trigger state is true
        if (shouldSetView) {
            setView('board');
            setShouldSetView(false); // Reset the trigger
        }
    }, [location.search, shouldSetView]);

    useEffect(() => {
        // Check if the URL search params contain 'highlighted'
        const query = new URLSearchParams(location.search);
        const taskId = query.get('highlighted');

        // Set the trigger state if there is a taskId in the URL
        if (taskId) {
            setShouldSetView(true);
        }
    }, [location.search]);
    

    const handleDateChange = (index, date) => {
        setTasks(prevTasks =>
            prevTasks.map((task, i) =>
                i === index
                    ? { ...task, dueDate: date }
                    : task
            )
        );
    };

    const handleDateChangeID = (taskId, date) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task._id === taskId
                    ? { ...task, dueDate: date }
                    : task
            )
        );
    };

    const formatDateSet = (date) => {
        if (!date) return 'No Due Date';
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    // Filter tasks by their status
    const backlogTasks = tasks.filter(task => task.status === 'backlog');
    const ongoingTasks = tasks.filter(task => task.status === 'ongoing');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    // Save code
    const saveTasks = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to save tasks.');
                return;
            }
    
            // Prepare tasks data with completion status and subtasks
            const tasksToSave = tasks.map((task, index) => {
                if (typeof task.text !== 'string' || 
                    typeof task.description !== 'string' || 
                    typeof task.completed !== 'boolean' || 
                    typeof task.status !== 'string') {
                    console.error('Task has an invalid format:', task);
                    return null;
                }
    
                // Prepare subtasks data if available
                let subtasksToSave = Array.isArray(task.subtasks) ? task.subtasks.map(subtask => {
                    if (typeof subtask.text !== 'string' || 
                        typeof subtask.completed !== 'boolean') {
                        console.error('Subtask has an invalid format:', subtask);
                        return null;
                    }
                    return {
                        text: subtask.text,
                        completed: subtask.completed,
                    };
                }).filter(subtask => subtask !== null) : [];
    
                // Check if there's an unsaved subtask in the current input
                if (newSubtask[index]) {
                    subtasksToSave.push({
                        text: newSubtask[index],
                        completed: false
                    });
                }
    
                return {
                    text: task.text,
                    description: task.description,
                    completed: task.completed,
                    status: task.status,
                    dueDate: task.dueDate,
                    subtasks: subtasksToSave,
                };
            }).filter(task => task !== null);
    
            console.log('Tasks to be saved:', tasksToSave);
    
            const response = await axios.post('http://localhost:8000/api/today',
                { tasks: tasksToSave },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            console.log('Tasks saved successfully:', response.data);
            toast.success('Changes saved');
            setIsLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Token is invalid or expired:', error);
                toast.error('Session expired. Please log in again.');
                setIsLoading(false);
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else if (error.response && error.response.status === 404) {
                console.error('Route not found:', error);
                toast.error('The requested resource was not found.');
                setIsLoading(false);
            } else {
                console.error('Error saving tasks:', error);
                toast.error('There was an error saving your tasks.');
                setIsLoading(false);
            }
        }
    };   

    // Add task
    const addTask = () => {
        setTasks([...tasks, { text: '', description: '', completed: false, status: 'backlog', subtasks: [] }]);
    };

    // Description change
    const handleDescriptionChange = (identifier, description) => {
        const newTasks = [...tasks];
    
        if (typeof identifier === 'number') {
            // Handle by index (for list view)
            newTasks[identifier].description = description;
        } else {
            // Handle by task ID (for board view)
            const taskIndex = newTasks.findIndex(task => task._id === identifier);
            if (taskIndex !== -1) {
                newTasks[taskIndex].description = description;
            }
        }
    
        setTasks(newTasks);
    };
    
    // Task change
    const handleTaskChange = (identifier, newText) => {
        const updatedTasks = [...tasks];
        
        // Check if the identifier is a number (index) or a string (ID)
        const isIndex = typeof identifier === 'number';
        
        let taskIndex;
        
        if (isIndex) {
            // If the identifier is a number, it is an index
            taskIndex = identifier;
        } else {
            // If the identifier is a string, it is an ID
            taskIndex = updatedTasks.findIndex(task => task._id === identifier);
        }
    
        if (taskIndex !== -1) {
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], text: newText };
            setTasks(updatedTasks);
        } else {
            console.error('Task not found');
        }
    };

    // const handleSubtaskChange = (taskIndex, subtaskIndex, newValue) => {
    //     const updatedTasks = [...tasks];
    //     updatedTasks[taskIndex].subtasks[subtaskIndex].text = newValue;
    //     setTasks(updatedTasks);
    // };    


    const handleSubtaskChange = (taskId, subtaskIndex, newText) => {
        const updatedTasks = [...tasks];
        const task = updatedTasks.find(task => task._id === taskId);
    
        if (!task) {
            console.error('Task not found');
            return;
        }
    
        // Ensure subtasks array exists
        if (!task.subtasks) {
            task.subtasks = [];
        }
    
        if (subtaskIndex >= 0 && subtaskIndex < task.subtasks.length) {
            // Update the specific subtask's text
            task.subtasks[subtaskIndex].text = newText;
        } else {
            console.error('Subtask index out of bounds');
            return;
        }
    
        setTasks(updatedTasks);
        saveTasks(); // Save changes to backend
    };

    
    const [newSubtask, setNewSubtask] = useState({});

    const handleNewSubtaskChange = (taskIndex, value) => {
        setNewSubtask(prevState => ({
            ...prevState,
            [taskIndex]: value,
        }));
    };    
    
    const handleAddSubtaskKeyDown = (taskIndex, event, subtaskIndex) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action of the Enter key
    
            const updatedTasks = [...tasks];
            const currentSubtasks = updatedTasks[taskIndex].subtasks;
    
            // Handle adding a new subtask
            if (subtaskIndex === -1) {
                if (newSubtask[taskIndex].trim() !== '') {
                    currentSubtasks.push({
                        text: newSubtask[taskIndex],
                        completed: false,
                    });
    
                    // Clear the new subtask input
                    setNewSubtask(prevState => ({ ...prevState, [taskIndex]: '' }));
                    setTasks(updatedTasks);
                    saveTasks(); // Save changes to backend
                }
                return;
            }
    
            // For existing subtasks, handle splitting the text into a new subtask
            const currentSubtaskText = currentSubtasks[subtaskIndex].text || '';
            const caretPosition = event.target.selectionStart;
    
            const newSubtaskText = currentSubtaskText.slice(caretPosition).trim();
            const remainingSubtaskText = currentSubtaskText.slice(0, caretPosition).trim();
    
            currentSubtasks[subtaskIndex].text = remainingSubtaskText;
    
            // Insert the new subtask below the current one with the text after the cursor
            currentSubtasks.splice(subtaskIndex + 1, 0, {
                text: newSubtaskText,
                completed: false,
            });
    
            setTasks(updatedTasks);
            saveTasks(); // Save changes to backend
    
            // Move the focus to the new subtask
            setTimeout(() => {
                const nextInput = document.querySelector(
                    `.subtask-input-div:nth-child(${subtaskIndex + 2}) input`
                );
                if (nextInput) nextInput.focus();
            }, 0);
        }
    };
    
    const handleAddSubtaskKeyDownID = (taskId, event, subtaskIndex) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action of the Enter key
    
            const updatedTasks = [...tasks];
            const task = updatedTasks.find(task => task._id === taskId);
    
            if (!task) return; // If the task is not found, exit early
    
            const currentSubtasks = task.subtasks;
    
            // Handle adding a new subtask
            if (subtaskIndex === -1) {
                if (newSubtask[taskId].trim() !== '') {
                    currentSubtasks.push({
                        text: newSubtask[taskId],
                        completed: false,
                    });
    
                    // Clear the new subtask input
                    setNewSubtask(prevState => ({ ...prevState, [taskId]: '' }));
                    setTasks(updatedTasks);
                    saveTasks(); // Save changes to backend
                }
                return;
            }
    
            // For existing subtasks, handle splitting the text into a new subtask
            const currentSubtaskText = currentSubtasks[subtaskIndex].text || '';
            const caretPosition = event.target.selectionStart;
    
            const newSubtaskText = currentSubtaskText.slice(caretPosition).trim();
            const remainingSubtaskText = currentSubtaskText.slice(0, caretPosition).trim();
    
            currentSubtasks[subtaskIndex].text = remainingSubtaskText;
    
            // Insert the new subtask below the current one with the text after the cursor
            currentSubtasks.splice(subtaskIndex + 1, 0, {
                text: newSubtaskText,
                completed: false,
            });
    
            setTasks(updatedTasks);
            saveTasks(); // Save changes to backend
    
            // Move the focus to the new subtask
            setTimeout(() => {
                const nextInput = document.querySelector(
                    `.subtask-input-div:nth-child(${subtaskIndex + 2}) input`
                );
                if (nextInput) nextInput.focus();
            }, 0);
        }
    };


    const handleSubtaskDelete = (taskIndex, subtaskIndex) => {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex].subtasks.splice(subtaskIndex, 1); // Remove the subtask at subtaskIndex
        setTasks(updatedTasks);
        saveTasks(); // Save changes to backend
    };    
    
    const handleSubtaskCheckboxChange = (taskIndex, subtaskIndex) => {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex].subtasks[subtaskIndex].completed = !updatedTasks[taskIndex].subtasks[subtaskIndex].completed;
        setTasks(updatedTasks);
        saveTasks(); // Save changes to backend
    };

    const handleCheckboxChange = (index) => {
    const newTasks = [...tasks];
    const task = newTasks[index];
    
    // Toggle the completed status
    task.completed = !task.completed;

    // Set status to "completed" if checked, otherwise reset it
    task.status = task.completed ? "completed" : "backlog"; // Adjust "backlog" to your initial status or another status as needed

    // Update the tasks state
    setTasks(newTasks);
    };

    const handleDelete = (identifier) => {
        const newTasks = tasks.filter(task => {
            // Check if the identifier is a number (index) or a string (ID)
            const isIndex = typeof identifier === 'number';
            
            if (isIndex) {
                // If the identifier is a number, it is an index
                return tasks.indexOf(task) !== identifier;
            } else {
                // If the identifier is a string, it is an ID
                return task._id !== identifier;
            }
        });
    
        setTasks(newTasks);
    };
    

    const handleKeyDown = (index, e) => {
        const inputElements = document.querySelectorAll('.task-input');
        const currentInput = inputElements[index];
        const cursorPosition = e.target.selectionStart;

        if (e.key === 'Enter') {
            e.preventDefault();

            // Add a new task at the current index + 1
            const newTasks = [...tasks];
            newTasks.splice(index + 1, 0, { text: '', description: '', completed: false, status: 'backlog'}); // Insert empty task object at index + 1
            setTasks(newTasks);

            // Focus on the new input field
            setTimeout(() => {
                const nextInput = document.querySelectorAll('.task-input')[index + 1];
                if (nextInput) nextInput.focus();
            }, 0); // Delay to allow the new input to be rendered

        } else if (e.key === 'Backspace') {
            e.preventDefault();

            if (index === 0 && cursorPosition === 0 && tasks[index].text === '') {
                // Move text from the second field to the first if it's empty
                if (tasks.length > 1) {
                    const newTasks = [...tasks];
                    newTasks[0].text = newTasks[0].text + newTasks[1].text; // Append text from second field
                    newTasks.splice(1, 1); // Remove the second field
                    setTasks(newTasks);

                    // Focus on the first input and move cursor to the end
                    setTimeout(() => {
                        const firstInput = document.querySelectorAll('.task-input')[0];
                        if (firstInput) {
                            firstInput.focus();
                            firstInput.setSelectionRange(firstInput.value.length, firstInput.value.length);
                        }
                    }, 0); // Delay to allow the first input to be rendered
                }
            } else if (index > 0 && cursorPosition === 0 && tasks[index].text === '') {
                // Move text from the current input to the previous one
                const currentText = tasks[index].text;
                const prevText = tasks[index - 1].text;

                const newTasks = [...tasks];
                newTasks[index - 1].text = prevText + currentText; // Append current text to previous
                newTasks.splice(index, 1); // Remove the current input

                setTasks(newTasks);

                // Focus on the previous input and move cursor to the end
                setTimeout(() => {
                    const prevInput = document.querySelectorAll('.task-input')[index - 1];
                    if (prevInput) {
                        const cursorPosition = prevText.length; // Position between old and new text
                        prevInput.focus();
                        prevInput.setSelectionRange(cursorPosition, cursorPosition);
                    }
                }, 0); // Delay to allow the previous input to be rendered
            } else if (index >= 0 && cursorPosition > 0) {
                // Handle Backspace in other cases
                const newTasks = [...tasks];
                const updatedValue = tasks[index].text.slice(0, cursorPosition - 1) + tasks[index].text.slice(cursorPosition);
                newTasks[index].text = updatedValue;
                setTasks(newTasks);

                // Move cursor to the correct position
                setTimeout(() => {
                    if (currentInput) {
                        currentInput.focus();
                        currentInput.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
                    }
                }, 0); // Delay to allow the input to be rendered
            }

        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = Math.min(index + 1, inputElements.length - 1);
            const nextInput = inputElements[nextIndex];
            if (nextInput) nextInput.focus();

        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = Math.max(index - 1, 0);
            const prevInput = inputElements[prevIndex];
            if (prevInput) prevInput.focus();
        }
    };

    // Description toggle

    const [visibleDescriptions, setVisibleDescriptions] = useState({});

    // Function to toggle description visibility for a specific task
    const toggleDescription = (index) => {
        setVisibleDescriptions(prevState => {
            console.log('Previous State:', prevState); // Debugging line
            return {
                ...prevState,
                [index]: !prevState[index]
            };
        });
    };
    

    // Status logic
    
    const [visibleStatusIndex, setVisibleStatusIndex] = useState(null);
    const [iconColor, setIconColor] = useState(''); // Initial icon color can be set here

    const handleStatusSelect = async (task, status, color) => {
        try {
            // Update the task status locally
            const updatedTasks = tasks.map(t => {
                if (t._id === task._id) {
                    return { ...t, status: status };
                }
                return t;
            });
    
            setTasks(updatedTasks);
    
            // Update color for the task
            setCustomColors(prevColors => ({
                ...prevColors,
                [task._id]: color // Update the color for the specific task
            }));
    
            // Save tasks to backend
            await saveTasks(); // Ensure this function call is correct as per your implementation
    
            setVisibleStatusIndex(null); // Close the status dropdown after selection
        } catch (error) {
            console.error('Failed to update task status:', error);
            toast.error('There was an error updating the task status.');
        }
    };
         

    const toggleStatusVisibility = (taskIndex) => {
        setVisibleStatusIndex(visibleStatusIndex === taskIndex ? null : taskIndex);
    };

    

    // Setting view

    // Initialize state to track the current view ('list' or 'board')
    const [view, setView] = useState('list');

    // Handlers to toggle views
    const showListView = () => setView('list');
    const showBoardView = () => setView('board');
    const showCalendarView = () => setView('calendar');

    // Loading function

    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
};

// Task timer logic

//     const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
//     const [tracking, setTracking] = useState(isTracking);

//     useEffect(() => {
//         let timer;
//         if (tracking) {
//             timer = setInterval(() => {
//                 setTimeSpent(prevTime => prevTime + 1);
//             }, 1000);
//         }
//         return () => clearInterval(timer);
//     }, [tracking]);

//     const handleStartTracking = async () => {
//         try {
//             await axios.post(`/api/today/${taskId}/start-tracking`);
//             setTracking(true);
//             toast.success('Tracking started');
//         } catch (error) {
//             console.error('Error starting tracking', error);
//         }
//     };

//     const handleStopTracking = async () => {
//         try {
//             await axios.post(`/api/today/${taskId}/stop-tracking`);
//             setTracking(false);
//             toast.success('Tracking stopped');
//         } catch (error) {
//             console.error('Error stopping tracking', error);
//         }
//     };

//     const formatTime = (seconds) => {
//         const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
//         const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
//         const s = (seconds % 60).toString().padStart(2, '0');
//         return `${h}:${m}:${s}`;
//     };


    return (
        <div className="today page pb-5">
            <ToastContainer />
            <div className='pb-4 d-flex justify-content-between align-items-center heading-and-toggle-div'>
                <div className='today-heading-div d-flex align-items-center'>
                    <div>
                        <h2 className='heading-font page-heading m-0'>Today</h2>
                    </div>
                    <div className='today-status-container'>
                        <div className='status-icon-div hover-icon'>
                            <i className={`status-icon fa-solid p-2 ${isLoading ? 'fa-spinner' : 'fa-check'}`}></i>
                            <span className="status-tooltip">
                                {isLoading ? 'Saving changes' : 'Changes saved'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className='d-flex toggle-view-div'>
                    <div onClick={showListView} className='hover-icon toggle-view-icon'><i className="p-2 fa-solid fa-bars"></i>
                        <span className='toggle-view-tooltip'>
                            List view 
                        </span>
                    </div>
                    <div onClick={showBoardView} className='hover-icon toggle-view-icon'><i className="p-2 fa-solid fa-square"></i>
                        <span className='toggle-view-tooltip'>
                            Board view 
                        </span>
                    </div>
                    <div onClick={showCalendarView} className='hover-icon toggle-view-icon'><i className="p-2 fa-solid fa-calendar"></i>
                        <span className='toggle-view-tooltip'>
                            Calendar view 
                        </span>
                    </div>
                </div>
                
            </div>

            {view === 'list' && (
    <div className="today-tasks list-task-view">
        {tasks.map((task, index) => (
            <div key={index} className={`task-item row align-items-start py-1 ${highlightedTaskId === index ? 'highlighted' : ''}`}>
                
                <div className="col-auto task-actions">
                    <button onClick={() => handleDelete(index)} className="normal-btn delete-btn p-0 pb-1 px-2 task-trash">
                        <i className="fa-solid fa-trash"></i>
                        <span className='task-trash-tooltip'>
                            Delete
                        </span>
                    </button>
                    <div className='task-checkbox-div'>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleCheckboxChange(index)}
                            className="task-checkbox p-2"
                        />
                        <span className='task-checkbox-tooltip'>
                            Done 
                        </span>
                    </div>
                </div>
                <div className="col task-content">
                    <div className='input-text-div px-2 py-2 p-1 my-2' style={{ textDecoration: task.completed ? 'line-through' : 'none', color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}>
                        <div className='d-flex justify-content-between'>
                            <input
                                type="text"
                                value={task.text}
                                onChange={(e) => handleTaskChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`task-input para-text-heading px-1 ${task.completed ? 'completed' : ''}`}
                                placeholder="Task Title"
                                style={{ textDecoration: task.completed ? 'line-through' : 'none', color: colors.sidebarText, backgroundColor: colors.sidebarBackground}}
                            />
                            <div className='d-flex align-items-center first-and-last'>
                            {/* <div className='today-task-timer d-flex align-items-center px-2'>
                                <p className='date-display-p m-0 px-2 pt-1'>{formatTime(timeSpent)}</p>
                                <span className='mx-1 tracker-icon-container'>
                                    {tracking ? (
                                        <i className='fa-solid fa-pause tracker-icon' onClick={handleStopTracking}></i>
                                    ) : (
                                        <i className='fa-solid fa-play tracker-icon' onClick={handleStartTracking}></i>
                                    )}
                                </span>
                            </div> */}

                                {task.dueDate && (
                                    <span className="date-display d-flex align-items-center">
                                        <i className='fa-solid fa-calendar calendar-red'></i>
                                        <p className='m-0 px-2 date-display-p'>{formatDateSet(task.dueDate)}</p>
                                        
                                    </span>
                                )}
                                <span className="toggle-icons" onClick={() => toggleDescription(index)}>
                                    <i className={`fa-solid hover-icon p-2 ${visibleDescriptions[index] ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                </span>
                                
                            </div>
                            
                        </div>

                        {visibleDescriptions[index] && (
                            <div className='task-details-div'>
                                <div>
                                    <textarea
                                        value={task.description}
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                        className="task-description para-text mt-2 px-2"
                                        placeholder="Task Description"
                                        style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
                                    />
                                </div>
                                <hr className='mx-2'/>

                                {/* Subtasks */}
                                <div className='subtasks'>
    <p className='subtask-heading'>Subtasks</p>
    {task.subtasks.map((subtask, subtaskIndex) => (
        <div key={subtaskIndex} className='subtask-input-div'>
            <div className="subtask-actions d-flex">
                <button onClick={() => handleSubtaskDelete(index, subtaskIndex)} className="subtask-delete-btn delete-btn p-0 pb-1 px-2 task-trash">
                    <i className="fa-solid fa-trash"></i>
                    <span className='task-trash-tooltip'>Delete</span>
                </button>
                <div className='task-checkbox-div'>
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskCheckboxChange(index, subtaskIndex)}
                        className="subtask-checkbox p-2"
                    />
                    <span className='task-checkbox-tooltip'>Done</span>
                </div>
            </div>
            <input
                type="text"
                value={subtask.text}
                onChange={(e) => handleSubtaskChange(index, subtaskIndex, e.target.value, false)}
                onKeyDown={(e) => handleAddSubtaskKeyDown(index, e, subtaskIndex)}
                className={`task-input para-text-heading px-1 py-2 ${subtask.completed ? 'completed' : ''}`}
                placeholder="Enter subtask"
                style={{ textDecoration: subtask.completed ? 'line-through' : 'none', color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
            />
        </div>
    ))}
    <div className='subtask-input-div'>
        <input
            type="text"
            value={newSubtask[index] || ''}
            onChange={(e) => handleNewSubtaskChange(index, e.target.value)}
            onKeyDown={(e) => handleAddSubtaskKeyDown(index, e, -1)} // Passing -1 for new subtask input
            className={`task-input para-text-heading px-1`}
            placeholder="Add a new subtask"
            style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
        />
    </div>
                                </div>
                                <hr className='mx-2'/>
                                {/* Due Date */}

                                <div className='pb-1 d-flex justify-content-between'>
                                    <div className='d-flex align-items-center first-and-last pb-2'>
                                        <p className='subtask-heading m-0'>Due Date: </p>
                                        <div>
                                            <input
                                                id={`date-input-${index}`}
                                                className='task-date-input'
                                                type="date"
                                                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="px-2 py-2 mx-2 timestamp-info-btn hover-icon d-inline">
                                        <i className="fa-solid fa-circle-info"></i>
                                        <span className="timestamps-info py-1 px-2">
                                            <p className="p-0 m-0">Created At: {new Date(task.createdAt).toLocaleString()}</p>
                                            <p className='p-0 m-0'>Updated At: {new Date(task.updatedAt).toLocaleString()}</p>
                                        </span>
                                    </div>
                                </div>
                                
                                
                                
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        ))}
        <div className='first-and-last d-flex pt-3 today-save-btn-div'>
            <button className="normal-btn" onClick={addTask}>Add task</button>
            <button className="normal-btn" onClick={saveTasks}>Save</button>
        </div>
    </div> 
)}


{view === 'board' && (
    <div className="board-task-view pt-5">
        <div className='board-heading-row d-flex para-heading'>
            <div className='col-sm-4'>
                <p>Backlog</p>
            </div>
            <div className='col-sm-4'>
                <p>Ongoing</p>
            </div>
            <div className='col-sm-4'>
                <p>Completed</p>
            </div>
        </div>

        <div className="task-item row align-items-start py-1 px-0">
            {/* Backlog Tasks */}
            <div className='col-sm-4'>
                {backlogTasks.map((task) => (
                    <div key={task._id} className='task-col-content'>
                        <div className='board-task-div p-3 mb-3' style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}>
                            <TaskItem 
                                task={task} 
                                colors={colors} 
                                handleTaskChange={handleTaskChange}
                                toggleDescription={toggleDescription}
                                visibleDescriptions={visibleDescriptions}
                                handleDescriptionChange={handleDescriptionChange}
                                handleDelete={handleDelete}
                                toggleStatusVisibility={toggleStatusVisibility}
                                customColors={customColors}
                                getStatusColor={getStatusColor}
                                handleStatusSelect={handleStatusSelect}
                                visibleStatusIndex={visibleStatusIndex}

                                handleSubtaskDelete={handleSubtaskDelete}
                                handleSubtaskCheckboxChange={handleSubtaskCheckboxChange}
                                // handleAddSubtaskKeyDown={handleAddSubtaskKeyDown}
                                newSubtask={newSubtask}
                                handleNewSubtaskChange={handleNewSubtaskChange}
                                handleSubtaskChange={handleSubtaskChange}

                                handleAddSubtaskKeyDownID={handleAddSubtaskKeyDownID}

                                handleDateChangeID={handleDateChangeID}
                                formatDateSet={formatDateSet}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Ongoing Tasks */}
            <div className='col-sm-4'>
                {ongoingTasks.map((task) => (
                    <div key={task._id} className="task-col-content">
                        <div className='board-task-div p-3 mb-3' style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}>
                            <TaskItem 
                                task={task} 
                                colors={colors} 
                                handleTaskChange={handleTaskChange}
                                toggleDescription={toggleDescription}
                                visibleDescriptions={visibleDescriptions}
                                handleDescriptionChange={handleDescriptionChange}
                                handleDelete={handleDelete}
                                toggleStatusVisibility={toggleStatusVisibility}
                                customColors={customColors}
                                getStatusColor={getStatusColor}
                                handleStatusSelect={handleStatusSelect}
                                visibleStatusIndex={visibleStatusIndex}

                                handleSubtaskDelete={handleSubtaskDelete}
                                handleSubtaskCheckboxChange={handleSubtaskCheckboxChange}
                                handleAddSubtaskKeyDown={handleAddSubtaskKeyDown}
                                newSubtask={newSubtask}
                                handleNewSubtaskChange={handleNewSubtaskChange}
                                handleSubtaskChange={handleSubtaskChange}

                                handleAddSubtaskKeyDownID={handleAddSubtaskKeyDownID}

                                handleDateChangeID={handleDateChangeID}
                                formatDateSet={formatDateSet}
                                
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Completed Tasks */}
            <div className='col-sm-4'>
                {completedTasks.map((task) => (
                    <div key={task._id} className='task-col-content'>
                        <div className={`board-task-div p-3 mb-3 ${highlightedTaskId === task._id ? 'highlighted' : ''}`}
                        style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}>
                            <TaskItem 
                                task={task} 
                                colors={colors} 
                                handleTaskChange={handleTaskChange}
                                toggleDescription={toggleDescription}
                                visibleDescriptions={visibleDescriptions}
                                handleDescriptionChange={handleDescriptionChange}
                                handleDelete={handleDelete}
                                toggleStatusVisibility={toggleStatusVisibility}
                                customColors={customColors}
                                getStatusColor={getStatusColor}
                                handleStatusSelect={handleStatusSelect}
                                visibleStatusIndex={visibleStatusIndex}

                                handleSubtaskDelete={handleSubtaskDelete}
                                handleSubtaskCheckboxChange={handleSubtaskCheckboxChange}
                                handleAddSubtaskKeyDown={handleAddSubtaskKeyDown}
                                newSubtask={newSubtask}
                                handleNewSubtaskChange={handleNewSubtaskChange}
                                handleSubtaskChange={handleSubtaskChange}

                                handleAddSubtaskKeyDownID={handleAddSubtaskKeyDownID}

                                handleDateChangeID={handleDateChangeID}
                                formatDateSet={formatDateSet}
                                
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className='first-and-last d-flex pt-3 board-today-save-btn-div'>
            <button className="normal-btn" onClick={addTask}>Add task</button>
            <button className="normal-btn" onClick={saveTasks}>Save</button>
        </div>
    </div>
)}

{view === 'calendar' && (
    <div>
        <CalendarView tasks={tasks}/>
    </div>
)}

</div>
);
}
export default Today;
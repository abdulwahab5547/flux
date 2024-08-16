// Search.js
import React, { useState } from 'react';
import './Search.css';
import { useNavigate } from 'react-router-dom'; 

function Search({ tasks, colors}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);

    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = tasks.filter(task => {
            const taskText = task.text.toLowerCase();
            const subtasksText = task.subtasks
                ? task.subtasks.map(subtask => subtask.text.toLowerCase()).join(' ')
                : '';
            return taskText.includes(term) || subtasksText.includes(term);
        });

        setFilteredTasks(filtered);
    };

    const handleItemClick = (taskId) => {
        navigate(`/home/today?highlighted=${taskId}`);
    };

    return (
        <div className="search-overlay">
            <div className="search-container">
                <div className='d-flex justify-content-center'>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search tasks..."
                        className="search-input para-text-heading"
                        style={{ color: colors.mainText, backgroundColor: colors.mainBackground }}
                        autoFocus
                    />
                </div>
                
                <div className="search-results pt-3 px-2">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <div 
                                key={task._id} 
                                className="search-result-item p-3 my-3"
                                style={{ backgroundColor: colors.mainBackground }}
                                onClick={() => handleItemClick(task._id)} // Use task._id
                            >
                                <div className="search-result-title heading-font">{task.text}</div>
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <ul className="search-result-subtasks para-text pt-2 m-0">
                                        {task.subtasks.map((subtask, index) => (
                                            <li key={index}>{subtask.text}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className='para-text text-center'>No results found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;

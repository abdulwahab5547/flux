import './Upcoming.css';
import React, { useState, useEffect } from 'react';
import { format, isAfter, startOfTomorrow, getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function UpcomingNew({ tasks, colors, fetchTasks}) {
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date())); // Current month
    const [selectedYear, setSelectedYear] = useState(getYear(new Date())); // Current year

    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return (
            isAfter(dueDate, startOfTomorrow()) &&
            getMonth(dueDate) === selectedMonth &&
            getYear(dueDate) === selectedYear
        );
    });

    const tasksByDate = filteredTasks.reduce((acc, task) => {
        const formattedDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!acc[formattedDate]) acc[formattedDate] = [];
        acc[formattedDate].push(task);
        return acc;
    }, {});

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    const handleItemClick = (taskId) => {
        navigate(`/home/today?highlighted=${taskId}`);
    };

    return (
        <div className="upcoming page">
            <h2 className="heading-font">Upcoming</h2>
            
            <div className="date-selector pt-4">
                <select value={selectedMonth} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                            {format(new Date(2024, i, 1), 'MMMM')}
                        </option>
                    ))}
                </select>
                <select value={selectedYear} onChange={handleYearChange}>
                    {Array.from({ length: 3 }, (_, i) => (
                        <option key={i} value={getYear(new Date()) + i}>
                            {getYear(new Date()) + i}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display Tasks */}
            <div className="">
                {Object.keys(tasksByDate).length > 0 ? (
                    Object.keys(tasksByDate).map(date => (
                        <div key={date} className="task-group pt-3">
                            <h3 className="upcoming-task-date heading-font">{format(new Date(date), 'MMMM d, yyyy')}</h3>
                            <div className="">
                                {tasksByDate[date].map(task => (
                                    <div key={task._id} onClick={() => handleItemClick(task._id)}>
                                        <div className='upcoming-task-container p-3 my-3'
                                            style={{ backgroundColor: colors.sidebarBackground }}>
                                            <div>
                                                <h4 className="upcoming-task-title heading-font">
                                                    <span>{task.text}</span>
                                                </h4>
                                            </div>
                                            <div>
                                                {task.subtasks && task.subtasks.length > 0 && (
                                                    <ul className="subtask-list m-0">
                                                        {task.subtasks.map((subtask, index) => (
                                                            <li key={index} className="subtask-item">
                                                                {subtask.text}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='pt-2'>No tasks for the selected month.</p>
                )}
            </div>
        </div>
    );
}

export default UpcomingNew;

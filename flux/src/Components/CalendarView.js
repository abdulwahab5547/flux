import './CalendarView.css';
import './CalendarComponent.css';
import React, { useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

function Calendar({ tasks }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const handleMonthChange = (direction) => {
        setSelectedDate(prevDate => direction === 'next'
            ? addMonths(prevDate, 1)
            : subMonths(prevDate, 1)
        );
    };

    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });

    // Group tasks by their due dates
    const tasksByDate = tasks.reduce((acc, task) => {
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            if (!isNaN(date.getTime())) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                if (!acc[formattedDate]) acc[formattedDate] = [];
                acc[formattedDate].push(task);
            }
        }
        return acc;
    }, {});

    const monthYear = format(selectedDate, 'MMMM yyyy');

    return (
        <div className='calendar-width pt-4'>
            <div className="calendar-header pb-3 pb-3">
                <span className="toggle-icons calendar-toggle-icons py-2 px-1">
                    <i className='fa-solid calendar-hover-icon p-2 fa-arrow-left' onClick={() => handleMonthChange('prev')}></i>
                    <span className='px-2'>{monthYear}</span>
                    <i className='fa-solid calendar-hover-icon p-2 fa-arrow-right' onClick={() => handleMonthChange('next')}></i>
                </span>
            </div>
            <div className="calendar-view-one mt-3">
                {days.map(day => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const tasksForDate = tasksByDate[formattedDate] || [];

                    return (
                        <div key={formattedDate} className="calendar-day">
                            <div className="date-number">{format(day, 'd')}</div>
                            {tasksForDate.length > 0 && (
                                <div className="tasks-list">
                                    {tasksForDate.map(task => (
                                        <div key={task._id} className="calendar-task-item">
                                            <p className='m-0 pb-2'>-{task.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Calendar;

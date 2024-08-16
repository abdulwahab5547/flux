const TaskItem = ({
    task,
    colors,
    handleTaskChange,
    toggleDescription,
    visibleDescriptions,
    handleDescriptionChange,
    handleDelete,
    toggleStatusVisibility,
    customColors,
    getStatusColor,
    handleStatusSelect,
    visibleStatusIndex,

    handleSubtaskDelete,
    handleSubtaskChange,
    handleSubtaskCheckboxChange,
    newSubtask,
    handleNewSubtaskChange,

    handleAddSubtaskKeyDownID,

    formatDateSet,
    handleDateChangeID,
}) => (
    <div>
        <div className='justify-content-between d-flex'>
        <input
            type="text"
            value={task.text}
            onChange={(e) => handleTaskChange(task._id, e.target.value)}
            className={`board-task-input para-text-heading mb-2 px-1 ${task.completed ? 'completed' : ''} `}
            placeholder="Task Title"
            style={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: colors.sidebarText, backgroundColor: colors.sidebarBackground
            }}
        />
        <span className="toggle-icons" onClick={() => toggleDescription(task._id)}>
            <i className={`fa-solid hover-icon p-2 ${visibleDescriptions[task._id] ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
        </span>
        </div>

        {visibleDescriptions[task._id] && (
            <div>
                <div>
                    <textarea
                    value={task.description}
                    onChange={(e) => handleDescriptionChange(task._id, e.target.value)}
                    className="board-task-description para-text mt-2 px-1 pb-2"
                    placeholder="Task Description"
                    style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
                    />
                </div>

                {/* Subtasks */}

                <div className='subtasks pt-2 pb-4'>
                    <p className='subtask-heading'>Subtasks</p>
                    {task.subtasks.map((subtask, subtaskIndex) => (
                        <div key={subtaskIndex} className='subtask-input-div'>
                            <div className="subtask-actions d-flex">
                                <button onClick={() => handleSubtaskDelete(task._id, subtaskIndex)} className="subtask-delete-btn delete-btn p-0 pb-1 px-2 task-trash">
                                    <i className="fa-solid fa-trash"></i>
                                    <span className='task-trash-tooltip'>Delete</span>
                                </button>
                                <div className='task-checkbox-div'>
                                    <input
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => handleSubtaskCheckboxChange(task._id, subtaskIndex)}
                                        className="subtask-checkbox p-2"
                                    />
                                    <span className='task-checkbox-tooltip'>Done</span>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={subtask.text}
                                onChange={(e) => handleSubtaskChange(task._id, subtaskIndex, e.target.value, false)}
                                onKeyDown={(e) => handleAddSubtaskKeyDownID(task._id, e, subtaskIndex)}
                                className={`subtask-input para-text-heading px-1 py-2 ${subtask.completed ? 'completed' : ''}`}
                                placeholder="Enter subtask"
                                style={{ textDecoration: subtask.completed ? 'line-through' : 'none', color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
                            />
                        </div>
                    ))}
                    <div className='subtask-input-div'>
                        <input
                            type="text"
                            value={newSubtask[task._id] || ''}
                            onChange={(e) => handleNewSubtaskChange(task._id, e.target.value)}
                            onKeyDown={(e) => handleAddSubtaskKeyDownID(task._id, e, -1)} // Passing -1 for new subtask input
                            className={`subtask-input para-text-heading px-1`}
                            placeholder="Add a new subtask"
                            style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
                        />
                    </div>
                </div>

                <div className='d-flex align-items-center first-and-last pb-2'>
                    <p className='subtask-heading m-0'>Due Date: </p>
                    <div>
                        <input
                            id={`date-input-${task._id}`}
                            className='task-date-input'
                            type="date"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChangeID(task._id, e.target.value)}
                        />
                    </div>
                </div>


                <hr className='mx-2'/>


                {/* <div className='subtasks py-2 pb-4'>
    <p className='subtask-heading'>Subtasks</p>
    {task.subtasks.map((subtask, subtaskIndex) => (
        <div key={subtaskIndex} className='subtask-input-div'>
            <div className="subtask-actions d-flex">
                <button 
                    onClick={() => handleSubtaskDelete(task._id, subtaskIndex)} 
                    className="subtask-delete-btn delete-btn p-0 pb-1 px-2 task-trash">
                    <i className="fa-solid fa-trash"></i>
                    <span className='task-trash-tooltip'>Delete</span>
                </button>
                <div className='task-checkbox-div'>
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskCheckboxChange(task._id, subtaskIndex)}
                        className="subtask-checkbox p-2"
                    />
                    <span className='task-checkbox-tooltip'>Done</span>
                </div>
            </div>
            <input
                type="text"
                value={subtask.text}
                onChange={(e) => handleSubtaskChange(task._id, subtaskIndex, e.target.value, true)}
                onKeyDown={(e) => handleAddSubtaskKeyDown(task._id, e, subtaskIndex, true)}
                className={`subtask-input para-text-heading px-1 py-2 ${subtask.completed ? 'completed' : ''}`}
                placeholder="Enter subtask"
                style={{ textDecoration: subtask.completed ? 'line-through' : 'none', color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
            />
        </div>
    ))}
    <div className='subtask-input-div'>
        <input
            type="text"
            value={newSubtask[task._id] || ''}
            onChange={(e) => handleNewSubtaskChange(task._id, e.target.value)}
            onKeyDown={(e) => handleAddSubtaskKeyDown(task._id, e)}
            className={`task-input para-text-heading px-1`}
            placeholder="Add a new subtask"
            style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}
        />
    </div>
                </div> */}


            </div>
            
            
            
        )}

        <div className='d-flex align-items-center first-and-last pt-2'>
            <div onClick={() => handleDelete(task._id)} className="px-2 board-delete-btn hover-icon">
                <i className="fa-solid fa-trash"></i>
            </div>
            <button 
                className='board-delete-btn hover-icon px-2'
                onClick={() => toggleStatusVisibility(task._id)}
                style={{ color: customColors[task._id] || getStatusColor(task.status) }}
            >
                <i className="fa-solid fa-square"></i>
            </button>
            <div className="px-2 timestamp-info-btn hover-icon">
                <i className="fa-solid fa-circle-info"></i>
                <span className="timestamps-info py-1 px-2">
                    <p className="p-0 m-0">Created At: {new Date(task.createdAt).toLocaleString()}</p>
                    <p className='p-0 m-0'>Updated At: {new Date(task.updatedAt).toLocaleString()}</p>
                </span>
            </div>
            {task.dueDate && (
                <span className="date-display d-flex align-items-center">
                    <i className='fa-solid fa-calendar calendar-red'></i>
                    <p className='m-0 px-2 date-display-p'>{formatDateSet(task.dueDate)}</p>
                </span>
            )}
        </div>

        {visibleStatusIndex === task._id && (
            <div className='choose-task-status-div pt-3'>
                <div 
                    className='task-status-div d-flex align-items-center py-1 hover-icon'
                    onClick={() => handleStatusSelect(task, 'backlog', '#FFCC00')}
                >
                    <i className="backlog-icon px-2 fa-solid fa-square"></i>
                    <p className='m-0'>Backlog</p>
                </div>
                <div 
                    className='task-status-div d-flex align-items-center py-1 hover-icon'
                    onClick={() => handleStatusSelect(task, 'ongoing', '#3498DB')}
                >
                    <i className="ongoing-icon px-2 fa-solid fa-square text-center"></i>  
                    <p className='m-0'>Ongoing</p>
                </div>
                <div 
                    className='task-status-div d-flex align-items-center py-1 hover-icon'
                    onClick={() => handleStatusSelect(task, 'completed', '#27AE60')}
                >
                    <i className="completed-icon px-2 fa-solid fa-square"></i>
                    <p className='m-0'>Completed</p>
                </div>         
            </div>
        )}
        
    </div>
);

export default TaskItem;
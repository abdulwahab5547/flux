// Board.js

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskItem from './TaskItem';

const Board = ({ tasks, handleTaskChange, ...otherHandlers }) => {
    const [columns, setColumns] = useState({
        backlog: tasks.filter(task => task.status === 'backlog'),
        ongoing: tasks.filter(task => task.status === 'ongoing'),
        completed: tasks.filter(task => task.status === 'completed')
    });

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = columns[source.droppableId];
        const endColumn = columns[destination.droppableId];
        const [movedTask] = startColumn.splice(source.index, 1);

        movedTask.status = destination.droppableId; // Update task status
        endColumn.splice(destination.index, 0, movedTask);

        setColumns({
            ...columns,
            [source.droppableId]: startColumn,
            [destination.droppableId]: endColumn
        });

        // Optionally, you can update the status in the backend here
        // handleTaskChange(movedTask._id, movedTask);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
                {Object.keys(columns).map(columnId => (
                    <Droppable key={columnId} droppableId={columnId}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="column"
                            >
                                <h2>{columnId.charAt(0).toUpperCase() + columnId.slice(1)}</h2>
                                {columns[columnId].map((task, index) => (
                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="task-item"
                                            >
                                                <TaskItem
                                                    task={task}
                                                    colors={{ sidebarText: '#000', sidebarBackground: '#fff' }}
                                                    handleTaskChange={handleTaskChange}
                                                    // Pass other handlers and props as needed
                                                    {...otherHandlers}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default Board;
import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Today from './Today';
import UpcomingNew from './UpcomingNew';
// import Upcoming from './Upcoming';
import Goals from './Goals';
import NewPage from './NewPage';
import HomeCard from './HomeCard';
import Profile from './Profile';
import Overlay from './Overlay';
import Logout from './Logout';

import Search from './Search';


function Home({ changeTheme, colors, isDarkMode}) {
    const [tasks, setTasks] = useState([{ text: '', description: '', completed: false, status: 'backlog', dueDate: '' }]);
    const [goals, setGoals] = useState([{ text: '', description: '', completed: false}]);
    const location = useLocation();

    // Fetch tasks

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

            if (!token) {
                console.error('No token found');
                toast.info('Please log in to view your tasks.');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/today', {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });

            console.log('Fetched tasks:', response.data.tasks); // Debugging line

            // Ensure the tasks are in the expected format
            if (Array.isArray(response.data.tasks)) {
                const fetchedTasks = response.data.tasks.map(task => ({
                    _id: task._id,
                    text: task.text,
                    description: task.description,
                    completed: task.completed,
                    status: task.status,
                    dueDate: task.dueDate,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                    subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(subtask => ({
                        _id: subtask._id,
                        text: subtask.text,
                        completed: subtask.completed,
                    })) : [] // Ensure subtasks are in array format
                }));
                
                setTasks(fetchedTasks);

                // Initialize customColors with default colors based on status
                const initialColors = {};
                fetchedTasks.forEach(task => {
                    initialColors[task._id] = getStatusColor(task.status);
                });
                setCustomColors(initialColors);
                
            } else {
                console.error('Invalid tasks format:', response.data.tasks);
                toast.error('Received tasks data is not in the expected format.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Token is invalid or expired:', error);
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else if (error.response && error.response.status === 404) {
                console.error('Route not found:', error);
                toast.error('The requested resource was not found.');
            } else {
                console.error('Error fetching tasks:', error);
                toast.error('There was an error fetching your tasks.');
            }
        }
    };

    // Fetch goals

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

            if (!token) {
                console.error('No token found');
                // toast.info('Please log in to view your goals.');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/goals', {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });

            console.log('Fetched goals:', response.data.goals); // Debugging line

            // Ensure the goals are in the expected format
            if (Array.isArray(response.data.goals)) {
                const fetchedGoals = response.data.goals.map(goal => ({
                    _id: goal._id,
                    text: goal.text,
                    description: goal.description,
                    completed: goal.completed,
                }));

                setGoals(fetchedGoals);
            } else {
                console.error('Invalid goals format:', response.data.goals);
                // toast.error('Received goal data is not in the expected format.');
            }
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
                console.error('Error fetching goals:', error);
                // toast.error('There was an error fetching your goals.');
            }
        }
    };

    // Fetch user data

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organization: '',
    });
    

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/user', {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });

            console.log('User data response:', response.data);

            setUserData(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Token is invalid or expired:', error);
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else if (error.response && error.response.status === 404) {
                console.error('Route not found:', error);
                toast.error('The requested resource was not found.');
            } else {
                console.error('Error fetching user data:', error);
                toast.error("There was an error fetching user data. Make sure you're logged in.");
            }
        }
    }

    // Color change for backlog, ongoing, completed
    const getStatusColor = (status) => {
        switch (status) {
            case 'backlog':
                return '#FFCC00';
            case 'ongoing':
                return '#3498DB';
            case 'completed':
                return '#27AE60';
            default:
                return '#000'; // Default color if status is unknown
        }
    };
    const [customColors, setCustomColors] = useState({});

    useEffect(() => {
        fetchTasks();
    }, []);  

    useEffect(() => {
        fetchGoals();
    }, []);

    useEffect(() => {
        fetchUserData();
    }, []);

    // Overlay state and functions
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayContent, setOverlayContent] = useState(null);

    const toggleOverlay = (content) => {
        setOverlayContent(content);
        setIsOverlayVisible(prev => !prev);
    };

    const handleCancelClick = () => {
        setIsOverlayVisible(false);
    };

    // Sidebar state and functions
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // New page logic
    const [pages, setPages] = useState([]);
    const navigate = useNavigate();


    // Delete page logic

    const handleDeletePage = async (slug) => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }

            // Send delete request to backend
            await axios.delete(`http://localhost:8000/api/pages/${slug}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update pages state to remove the deleted page
            setPages(pages.filter(page => page.slug !== slug));
            toast.success('Page deleted successfully');
        } catch (error) {
            console.error('Error deleting page:', error);
            toast.error('There was an error deleting the page.');
        }
    };

    // Fetch page logic

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

                if (!token) {
                    console.error('No token found');
                    toast.info('Please log in to use all features.');
                    return;
                }

                const response = await axios.get('http://localhost:8000/api/pages', {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in Authorization header
                    }
                });

                console.log('Pages data response:', response.data);

                setPages(response.data); // Set the fetched pages in state
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error('Token is invalid or expired:', error);
                    toast.error('Session expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                } else if (error.response && error.response.status === 404) {
                    console.error('Route not found:', error);
                    toast.error('The requested resource was not found.');
                } else {
                    console.error('Error fetching pages data:', error);
                    toast.error("There was an error fetching pages data. Make sure you're logged in.");
                }
            }
        };

        fetchPages();
    }, []);

    const handleAddPage = async () => {
        const newPage = {
            id: pages.length + 1,
            name: `Page ${pages.length + 1}`,
            slug: `page-${pages.length + 1}`, // Unique slug for routing
            title: `Page ${pages.length + 1}`,
            iconClass: 'fa-solid fa-file',
            content: `Add content for page ${pages.length + 1}`
        };

        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }
            // Send the new page data to the backend
            const response = await axios.post('http://localhost:8000/api/new-page', newPage, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setPages([...pages, newPage]); // Add the page to local state
                navigate(`/home/new-page/${newPage.slug}`); // Navigate to the new page component
            } else {
                console.error('Failed to create new page');
            }
        } catch (error) {
            console.error('Error creating new page:', error);
        }
    };

    // Update page function

    const updatePage = (updatedPage) => {
        setPages((prevPages) =>
            prevPages.map((page) =>
                page.slug === updatedPage.slug ? updatedPage : page
            )
        );
    };

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const handleMouseEnter = (index) => {
        setHoveredIndex(index);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const handleHomeClick = () =>{
        navigate('/home/card');
    };

    return (
        <div className="home">
            <ToastContainer />
            <div className="para-text-heading-nav">
                <div className={`left-sidebar ${isSidebarVisible ? '' : 'hidden'}`}
                    style={{ color: colors.sidebarText, backgroundColor: colors.sidebarBackground }}>
                    <div className='sidebar-inner p-3 pt-4 pb-4'>
                        <div className="d-flex justify-content-between">
                            <div className='profile-div hover-icon d-flex align-items-center py-2 px-2' onClick={() => toggleOverlay(
                                <Profile colors={colors} userData={userData} setUserData={setUserData} fetchUserData={fetchUserData}/>
                            )}>
                                <div className='profile-pic-div p-1'>
                                {userData.profileImage ? (
                                    <img
                                        className='profile-pic'
                                        style={{ maxWidth: '22px', maxHeight: '22px', borderRadius: '50%' }}
                                        src={userData.profileImage}
                                        alt="Profile"
                                        
                                    />
                                    ) : (
                                        <i className="p-1 fa-solid fa-user"></i>
                                    )}
                                </div>
                                <div className='profile-name-div'>
                                    <p className='m-0'>{userData.firstName || 'User'}</p>
                                </div>
                                <span className='profile-div-tooltip'>
                                    Your account
                                </span>
                            </div>
                            <button className="hide-sidebar hover-icon" onClick={toggleSidebar}>
                                <div className="hQNkkcQ fb8d74bb _14423c92 e4e217d4 _5f8879d9 b76144ce b4e05554">
                                    <svg style={{ color: colors.sidebarText }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path fill="currentColor" fillRule="evenodd" d="M19 4.001H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2Zm-15 2a1 1 0 0 1 1-1h4v14H5a1 1 0 0 1-1-1v-12Zm6 13h9a1 1 0 0 0 1-1v-12a1 1 0 0 0-1-1h-9v14Z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span className='hide-sidebar-tooltip'>
                                    Hide sidebar
                                </span>
                            </button>
                        </div>



                        <div className='pt-4 pb-2'>
                            <div style={{ color: colors.sidebarText }} 
                            className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'
                            onClick={() => toggleOverlay(
                                <Search tasks={tasks} colors={colors}/>
                            )}>
                                    <i className="fa-solid fa-search"></i>
                                    <p className='m-0'>Search</p>
                                    <span className='nav-page-select-tooltip'>
                                        Search tasks
                                    </span>
                            </div>
                        </div>

                        
                        <div className='pt-4'>
                                <p className='upcoming-task-date heading-font m-0 px-2 pb-2'>Navigation</p>
                                <div onClick={handleHomeClick} style={{ color: colors.sidebarText }} className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                    <i className="fa-solid fa-home"></i>
                                    <p className='m-0'>Home</p>
                                    <span className='nav-page-select-tooltip'>
                                        Go to Home
                                    </span>
                                </div>
                            
                            <Link to="today" className='no-style-link'>
                            <div style={{ color: colors.sidebarText }} className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                    <i className="fa-solid fa-list-check"></i>
                                    <p className='m-0'>Today</p>
                                    <span className='nav-page-select-tooltip'>
                                        Today's tasks
                                    </span>
                                </div>
                            </Link>
                            <Link to="upcomingnew" className='no-style-link'>
                            <div style={{ color: colors.sidebarText }} className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                    <i className="fa-solid fa-calendar-days"></i>
                                    <p className='m-0'>Upcoming</p>
                                    <span className='nav-page-select-tooltip'>
                                        Upcoming Tasks
                                    </span>
                                </div>
                            </Link>
                            
                            <Link to="goals" className='no-style-link'>
                                <div style={{ color: colors.sidebarText }} className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                    <i className="fa-solid fa-bullseye"></i>
                                    <p className='m-0'>Goals</p>
                                    <span className='nav-page-select-tooltip'>
                                        Your goals
                                    </span>
                                </div>
                                
                            </Link>
                            {/* <Link to="upcoming" className='no-style-link'>
                                <div style={{ color: colors.sidebarText }} className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                    <i className="fa-regular fa-calendar-days"></i>
                                    <p className='m-0'>Upcoming</p>
                                    <span className='nav-page-select-tooltip'>
                                        Upcoming tasks
                                    </span>
                                </div>
                            </Link> */}
                            <div
                                style={{ color: colors.sidebarText }}
                                className='hover-icon nav-page-select d-flex align-items-center py-1 p-1 px-2'
                                onClick={handleAddPage}>
                                <i className="fa-solid fa-add"></i>
                                <p className='m-0'>New Page</p>
                                <span className='nav-page-select-tooltip'>
                                    Create a new page
                                </span>
                            </div>
                        </div>
                        
                        {/* IMP */}

                        <div className='user-pages-div pt-5'>
                        <p className='upcoming-task-date heading-font m-0 px-2 pb-2'>Your pages</p>
                        {pages.map((page, index) => (
                            <Link to={`new-page/${page.slug}`} key={page.id} 
                                className='no-style-link nav-new-page-div'
                                state={{ title: page.title, content: page.content, iconClass: page.iconClass }}>
                            <div 
                                className='d-flex justify-content-between hover-icon tooltip-container'
                                onMouseEnter={() => handleMouseEnter(index)} 
                                onMouseLeave={handleMouseLeave}
                            >
                                <div
                                style={{ color: colors.sidebarText }}
                                className='hover-icon nav-new-page-hover nav-page-select d-flex align-items-center py-1 p-1 px-2'>
                                <i className={page.iconClass}></i>
                                <p className='m-0 sidebar-title'>{page.title}</p>
                                <span className='sidebar-title-tooltip'>
                                    {page.title}
                                </span>
                                </div>
                                {hoveredIndex === index && (
                                <div
                                    style={{ color: colors.sidebarText }}
                                    className='nav-page-select d-flex align-items-center py-1 p-1 px-2'
                                    onClick={() => handleDeletePage(page.slug)}>
                                    <i className="fa-solid fa-trash"></i>
                                </div>
                                )}
                            </div>
                            </Link>
                        ))}
                        </div>



                        <div className='toggle-dark-mode mt-auto d-flex justify-content-between'>

                            <div className='lightbulb-icon-div hover-icon px-2 py-2' onClick={changeTheme}>
                                <i className="px-1 fa-solid fa-lightbulb"></i>
                                <span className='lightbulb-icon-tooltip'>
                                    Change theme
                                </span>
                            </div>

                            <div className='logout-icon-div hover-icon px-2 py-2' onClick={() => toggleOverlay(
                                <Logout cancel={handleCancelClick} />
                            )}>
                                <i className="px-1 fa-solid fa-right-from-bracket"></i>
                                <span className='logout-icon-tooltip'>
                                    Log out
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`right-part p-3 ${isSidebarVisible ? '' : 'sidebar-hidden'}`} style={{ color: colors.mainText, backgroundColor: colors.mainBackground }}>
                    <div className='right-part-max'>
                        <div>
                            <button className={`show-sidebar hover-icon ${isSidebarVisible ? 'hidden' : ''}`} onClick={toggleSidebar}>
                                <div className="hQNkkcQ fb8d74bb _14423c92 e4e217d4 _5f8879d9 b76144ce b4e05554">
                                    <svg style={{ color: colors.sidebarText }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path fill="currentColor" fillRule="evenodd" d="M19 4.001H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2Zm-15 2a1 1 0 0 1 1-1h4v14H5a1 1 0 0 1-1-1v-12Zm6 13h9a1 1 0 0 0 1-1v-12a1 1 0 0 0-1-1h-9v14Z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span className='show-sidebar-tooltip'>
                                    Show sidebar
                                </span>
                            </button>
                        </div>
                        <div className='p-2 pt-4'>
                            <Routes>
                                <Route path="card" element={<HomeCard colors={colors} tasks={tasks} fetchTasks={fetchTasks} isDarkMode={isDarkMode} pages={pages.slice(0, 3)} />}/>
                                <Route path="today" element={<Today colors={colors} tasks={tasks} setTasks={setTasks} fetchTasks={fetchTasks} getStatusColor={getStatusColor} customColors={customColors} setCustomColors={setCustomColors}/>}/>
                                <Route path="upcomingnew" element={<UpcomingNew colors={colors} tasks={tasks} fetchTasks={fetchTasks}/>} />
                                {/* <Route path="upcoming" element={<Upcoming colors={colors} />} /> */}
                                <Route path="goals" element={<Goals colors={colors} goals={goals} setGoals={setGoals} fetchGoals={fetchGoals} />} />
                                <Route path="new-page/:slug" element={<NewPage updatePage={updatePage} colors={colors}/>} />
                            </Routes>
                            <Outlet/>
                        </div>
                    </div>
                </div>
            </div>
            
            <Overlay isVisible={isOverlayVisible} onClose={() => setIsOverlayVisible(false)} colors={colors}>
                {overlayContent}
            </Overlay>

            
        </div>
    );
}

export default Home;
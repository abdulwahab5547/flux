
import './HomeCard.css'
import CarouselSlider from './CarouselSlider';
import CalendarComponent from './CalendarComponent';
import { format, isAfter, startOfTomorrow, getMonth, getYear} from 'date-fns';
import React, { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';

function HomeCard({colors, tasks, isDarkMode, pages}) {
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date())); 
    const [selectedYear, setSelectedYear] = useState(getYear(new Date())); 

    const navigate = useNavigate();

    const renderTasks = () => {
        return tasks.slice(0, 4).map((task, index) => (
          <div
            key={index}
            className="card-task-div d-flex align-items-center py-2 first-and-last my-3 px-2"
            style={{ backgroundColor: colors.sidebarBackground, color: colors.sidebarText }}
          >
            <div className="card-circle-div">
            </div>
            <div className="card-task-input-div">
              {task.text} 
            </div>
          </div>
        ));
      };

      const renderUpcomingTasks = () => {
        const filteredTasks = tasks
          .filter(task => {
            const dueDate = new Date(task.dueDate);
            return (
              isAfter(dueDate, startOfTomorrow()) &&
              getMonth(dueDate) === selectedMonth &&
              getYear(dueDate) === selectedYear
            );
          })
          .slice(0, 3);

          return filteredTasks.map((task, index) => {
            const formattedDate = format(new Date(task.dueDate), 'MMM d'); // Format the date as "Aug 9", "Aug 10", etc.
      
            return (
              <div
                key={index}
                className="card-task-div d-flex align-items-center py-2 first-and-last my-3 px-2"
                style={{ backgroundColor: colors.sidebarBackground, color: colors.sidebarText }}
              >
                <div className="card-circle-div">
                </div>
                <div className="card-task-input-div ">
                    <p className='upcoming-card-text'>{task.text}</p>
                    <p className='upcoming-card-date'>{formattedDate}</p>
                </div>
              </div>
            );
          });
        };

    const handleTodayClick = () => {
        navigate(`/home/today`);
    }
    const handleUpcomingClick = () => {
        navigate(`/home/upcomingnew`);
    }

    const dottedClass = isDarkMode ? 'bg-dotted-dark' : 'bg-dotted-light';
     return (
      <div className="card-page page">
          <div className="px-2">
            <h2 className="heading-font">Home</h2>
          </div>
          
          <div className="card-items-container pt-1" >
            <div className="card-items-first-row d-flex">
            
                <div className={`card-item card-item-one col-md-4 col-lg-4 m-2 d-flex flex-column justify-content-between ${dottedClass}`}>
                    <div>
                    </div>
                    <div className="item-one-inner p-3">
                        {renderTasks()}
                    </div>
                    <div className="item-one-outer py-5 p-3"
                    style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                    onClick={handleTodayClick}
                    >
                        <h6 className="heading-font m-0 pb-1">Your Today's Tasks</h6>
                        <p className="heading-para m-0">Here are your daily tasks. </p>
                    </div>
                    
                </div>
                
                <div className={`card-item card-item-two bg-dotted col-md-4 col-lg-4 m-2 d-flex flex-column justify-content-between ${dottedClass}`}>
                    <div>
                    </div>
                    <div className="item-two-inner p-3">
                        {renderUpcomingTasks()}
                    </div>
                    <div className="item-two-outer py-5 p-3"
                    style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                    onClick={handleUpcomingClick}
                    >
                        <h6 className="heading-font m-0 pb-1">Your Upcoming Tasks</h6>
                        <p className="heading-para m-0">Here are your upcoming tasks. </p>
                    </div>
                </div>
                <div className="card-item card-item-three col-md-4 col-lg-4 m-2">
                    <div className="item-three-inner">
                        <CalendarComponent colors={colors}/>
                    </div>
                    <div className="item-three-outer py-5 p-3"
                    style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                    >
                        <h6 className="heading-font m-0 pb-1">Calendar</h6>
                        <p className="heading-para m-0">This is a calendar. </p>
                    </div>
                </div>
            </div>
            <div className="card-items-second-row d-flex pt-2">
            
                <div className={`card-item card-item-four col-md-7 col-lg-7 m-2 d-flex flex-column justify-content-between ${dottedClass}`}>
                    <div>
                    </div>
                    <div className="item-four-inner p-3 d-flex justify-content-center">

                    {pages.map((page, index) => (
                    <Link 
                        to={`/home/new-page/${page.slug}`}
                        key={index} 
                        className={`card-page-div page-${index + 1} no-underline-link py-2 my-3 px-2 d-flex align-items-center justify-content-center`}
                        style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                        state={{ title: page.title, content: page.content, iconClass: page.iconClass }} // Pass additional state if needed
                    >
                        <div className='card-page-content-div'>
                            <div className="card-page-icon text-center">
                                <i className="fa-solid fa-file"></i>  
                            </div>
                            <div className="card-task-input-div pt-2">
                                <p className='heading-para m-0'>{page.title}</p>
                            </div>
                            <div className='page-content-tooltip'>
                                <div className='page-tooltip-inner p-3'
                                style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                                >
                                    <p className='m-0'>{page.content}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    ))}

                        
                    </div>
                    <div className="item-four-outer py-5 p-3"
                    style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                    >
                        <h6 className="heading-font m-0 pb-1">Your Pages</h6>
                        <p className="heading-para m-0">Here are some of the pages you've created so far. </p>
                    </div>
                </div>
                <div className="card-item card-item-five col-md-5 col-lg-5 m-2 ">
                    <div className="item-five-inner">
                        <CarouselSlider colors={colors}/>
                    </div>
                    <div className="item-five-outer py-5 p-3"
                    style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}
                    >
                        <h6 className="heading-font m-0 pb-1">App info</h6>
                        <p className="heading-para m-0">Here is some info regarding this app that you might find useful.</p>
                    </div>
                </div>
            </div>
          </div>
      </div>
  );
}

export default HomeCard;
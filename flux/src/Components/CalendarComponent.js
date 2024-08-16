
import './CalendarComponent.css'

import React, { useEffect, useState } from 'react';

const CalendarComponent = ({colors}) => {
  const [calendar, setCalendar] = useState(new Date());
  const [localDate] = useState(new Date());
  const calWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calMonthName = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const firstDay = () => {
    return new Date(calendar.getFullYear(), calendar.getMonth(), 1);
  };

  const lastDay = () => {
    return new Date(calendar.getFullYear(), calendar.getMonth() + 1, 0);
  };

  const firstDayNumber = () => {
    return firstDay().getDay() + 1;
  };

  const lastDayNumber = () => {
    return lastDay().getDay() + 1;
  };

  const getPreviousMonthLastDate = () => {
    let lastDate = new Date(
      calendar.getFullYear(),
      calendar.getMonth(),
      0
    ).getDate();
    return lastDate;
  };

  const navigateToPreviousMonth = () => {
    setCalendar(new Date(calendar.setMonth(calendar.getMonth() - 1)));
  };

  const navigateToNextMonth = () => {
    setCalendar(new Date(calendar.setMonth(calendar.getMonth() + 1)));
  };

  const navigateToCurrentMonth = () => {
    setCalendar(new Date(localDate));
  };

  const displayYear = () => {
    return calendar.getFullYear();
  };

  const displayMonth = () => {
    return calMonthName[calendar.getMonth()];
  };

  const selectDate = (date) => {
    console.log(`${date} ${calMonthName[calendar.getMonth()]} ${calendar.getFullYear()}`);
  };

  const plotDates = () => {
    let count = 1;
    let prevDateCount = 0;
    let prevMonthLastDate = getPreviousMonthLastDate(); // Change from const to let
    let prevMonthDatesArray = [];
    const calendarDays = daysInMonth(calendar.getMonth() + 1, calendar.getFullYear());
    let datesArray = [];
  
    for (let i = 1; i < calendarDays; i++) {
      if (i < firstDayNumber()) {
        prevDateCount += 1;
        prevMonthDatesArray.push(prevMonthLastDate--); // Now prevMonthLastDate can be decremented
        datesArray.push({ type: 'prev', date: null });
      } else {
        datesArray.push({ type: 'current', date: count++ });
      }
    }
  
    for (let j = 0; j < prevDateCount + 1; j++) {
      datesArray.push({ type: 'next', date: count++ });
    }
  
    return datesArray;
  };

  const highlightToday = () => {
    let currentMonth = localDate.getMonth() + 1;
    let changedMonth = calendar.getMonth() + 1;
    let currentYear = localDate.getFullYear();
    let changedYear = calendar.getFullYear();

    if (currentYear === changedYear && currentMonth === changedMonth) {
      return localDate.getDate();
    }
    return null;
  };

  useEffect(() => {
    plotDates();
  }, [calendar]);

  const datesArray = plotDates();
  const today = highlightToday();

  return (
    <div className="calendar" style={{backgroundColor: colors.mainBackground, color: colors.mainText}}>
      <div className="calendar-inner">
        <div className="calendar-controls">
          <div className="calendar-prev">
            <a href="#" onClick={navigateToPreviousMonth}>
              &lt;
            </a>
          </div>
          <div className="calendar-year-month">
            <div className="calendar-month-label">{displayMonth()}</div>
            <div>-</div>
            <div className="calendar-year-label">{displayYear()}</div>
          </div>
          <div className="calendar-next">
            <a href="#" onClick={navigateToNextMonth}>
              &gt;
            </a>
          </div>
        </div>
        <div className="calendar-today-date" style={{backgroundColor: colors.sidebarBackground, color: colors.sidebarText}}>
          Today: {calWeekDays[localDate.getDay()]}, {localDate.getDate()},{" "}
          {calMonthName[localDate.getMonth()]} {localDate.getFullYear()}
        </div>
        <div className="calendar-body">
          {calWeekDays.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
          {datesArray.map((dateObj, index) => (
            <div
              key={index}
              className={`number-item ${dateObj.type}-dates ${
                today === dateObj.date ? 'calendar-today' : ''
              }`}
              onClick={() => dateObj.date && selectDate(dateObj.date)}
            >
              <a className="dateNumber" href="#">
                {dateObj.date}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;


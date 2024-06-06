import React, { useState } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Shortener.css';

const apiUrl = 'http://localhost:3000/api/shorten';

const Shortener = ({ addLink }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [showCalendar, setShowCalendar] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleClick = async () => {
    if (input === '') return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ long_url: input, expire_at: selectedDate.toISOString() }), 
        headers: {
          'Content-type': 'application/json',
        },
      });
      if (response.status === 404) {
        alert('Unable to reach server');
        setInput('');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        setInput('');
        setLoading(false);
        return;
      }

      const newItem = {
        url: input,
        shortUrl: data.short_url,
      };
      addLink(newItem);
      setInput('');
      setLoading(false);
    } catch (err) {
      alert('Server Error');
      setInput('');
      setLoading(false);
    }
  };

  const toggleCalendar = () => {
    setShowCalendar(prevState => !prevState);
  };

  const override = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div className="shortener rounded-lg">
      <form className="">
        <div className="input-area">
          <input type="url" placeholder="Shorten a link here..." id="input" onChange={handleInputChange} value={input} />
          <p className="warning">Please add a link</p>
        </div>
        <button className="btn-cta" type="button" onClick={handleClick} disabled={loading}>
          {loading ? (
            <PulseLoader color={'white'} cssOverride={override} size={11} aria-label="Loading Spinner" data-testid="loader" />
          ) : (
            'Shorten it!'
          )}
        </button>
      </form>
      <button className="calendar-btn" type="button" onClick={toggleCalendar}>
        {showCalendar ? 'Close Calendar' : 'Open Calendar'}
      </button>
      <div className={`calendar-container ${showCalendar ? 'show' : ''}`}>
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>
    </div>
  );
};

export default Shortener;

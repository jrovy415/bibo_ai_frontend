import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TD2.css';
import { FaTachometerAlt, FaUsers, FaCog, FaChartBar, FaQuestionCircle, FaSignOutAlt, FaUserGraduate, FaClipboardList, FaBook, FaPoll } from 'react-icons/fa';

import { LOCAL_API_BASE_URL, REMOTE_API_BASE_URL } from './apiConfig';

const iconMap = {
  Dashboard: <FaTachometerAlt />,
  Students: <FaUserGraduate />,
  Sessions: <FaClipboardList />,
  Quizzes: <FaBook />,
  'Quiz Scores': <FaPoll />,
  Users: <FaUsers />,
  Settings: <FaCog />,
  Reports: <FaChartBar />,
  Help: <FaQuestionCircle />,
  Logout: <FaSignOutAlt />,
};

const TD2 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [transcriptions, setTranscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizScores, setQuizScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchData = async (endpoint, setData, setError) => {
      try {
        setLoading(true);
        setError(null);
        let response;
        try {
          response = await axios.get(`${LOCAL_API_BASE_URL}/${endpoint}`);
        } catch (localError) {
          response = await axios.get(`${REMOTE_API_BASE_URL}/${endpoint}`);
        }
        setData(response.data);
      } catch (err) {
        setError(`Failed to fetch data from ${endpoint}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeMenu === 'Transcriptions') {
      fetchData('transcriptions', setTranscriptions, setError);
    } else if (activeMenu === 'Students') {
      fetchData('students', setStudents, setError);
    } else if (activeMenu === 'Sessions') {
      fetchData('sessions', setSessions, setError);
    } else if (activeMenu === 'Quizzes') {
      fetchData('quizzes', setQuizzes, setError);
    } else if (activeMenu === 'Quiz Scores') {
      fetchData('quiz_scores', setQuizScores, setError);
    }
  }, [activeMenu]);

  const renderContent = () => {
    if (loading) return <div>Loading {activeMenu.toLowerCase()}...</div>;
    if (error) return <div>{error}</div>;

    if (activeMenu === 'Transcriptions') {
      if (transcriptions.length === 0) return <p>No transcriptions found.</p>;

      return (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th style={{ maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Text</th>
              <th>Language</th>
              <th>Duration (s)</th>
              <th>Processing Time (s)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transcriptions.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td style={{ maxWidth: '400px', wordWrap: 'break-word', whiteSpace: 'normal' }}>{t.text}</td>
                <td>{t.language || '-'}</td>
                <td>{t.duration ? t.duration.toFixed(2) : '-'}</td>
                <td>{t.processing_time ? t.processing_time.toFixed(2) : '-'}</td>
                <td>{new Date(t.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeMenu === 'Students') {
      if (students.length === 0) return <p>No students found.</p>;

      return (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nickname</th>
              <th>Grade Level</th>
              <th>Section</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.nickname}</td>
                <td>{s.grade_level}</td>
                <td>{s.section}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeMenu === 'Sessions') {
      if (sessions.length === 0) return <p>No sessions found.</p>;

      return (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student ID</th>
              <th>Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(sess => (
              <tr key={sess.id}>
                <td>{sess.id}</td>
                <td>{sess.student_id}</td>
                <td>{sess.type}</td>
                <td>{new Date(sess.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeMenu === 'Quizzes') {
      if (quizzes.length === 0) return <p>No quizzes found.</p>;

      return (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.name}</td>
                <td>{q.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeMenu === 'Quiz Scores') {
      if (quizScores.length === 0) return <p>No quiz scores found.</p>;

      return (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student ID</th>
              <th>Quiz ID</th>
              <th>Score</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {quizScores.map(qs => (
              <tr key={qs.id}>
                <td>{qs.id}</td>
                <td>{qs.student_id}</td>
                <td>{qs.quiz_id}</td>
                <td>{qs.score}</td>
                <td>{new Date(qs.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <div>
          <p>Welcome to the new dashboard template with sidebar.</p>
          {/* Add your dashboard content here */}
        </div>
      );
    }
  };

  const handleMenuClick = (item) => {
    if (item === 'Logout') {
      navigate('/');
    } else {
      setActiveMenu(item);
    }
  };

  return (
    <div className="td2-container">
      <button className="toggle-btn sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? '×' : '☰'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="profile-info">
          <h3>John Doe</h3>
          <p>Administrator</p>
        </div>
        <ul className="menu">
          {['Students', 'Sessions', 'Quizzes', 'Quiz Scores', 'Logout'].map(item => (
            <li
              key={item}
              onClick={() => handleMenuClick(item)}
              style={{ fontWeight: activeMenu === item ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {iconMap[item]}
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>{activeMenu}</h1>
        </header>
        <section className="content" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          {renderContent()}
        </section>
      </div>
    </div>
  );
};

export default TD2;

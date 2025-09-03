import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AIintro = () => {
  const [activeTab, setActiveTab] = useState('Student');
  const [nickname, setNickname] = useState('');
  const [gradeLevel, setGradeLevel] = useState('kinder');
  const [section, setSection] = useState('1');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentError, setStudentError] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const navigate = useNavigate();

  // Handle student form submission with basic validation
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setStudentError('Please enter a valid nickname.');
      return;
    }
    setStudentError('');
    // Additional validation can be added here if needed
    navigate('/student');
  };

  // Handle teacher form submission with basic validation
  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setTeacherError('Please enter your username.');
      return;
    }
    if (!password) {
      setTeacherError('Please enter your password.');
      return;
    }
    setTeacherError('');
    // TODO: Add real authentication logic here
    navigate('/dashboard');
  };

  const activeColor = '#a8d5a2'; // lighter green

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', backgroundColor: '#f9f9f9' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '320px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              borderBottom: '1px solid #ccc',
              borderRadius: '8px 8px 0 0',
              backgroundColor: '#f1f1f1',
            }}
          >
            <button
              onClick={() => setActiveTab('Student')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === 'Student' ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'Student' ? `3px solid ${activeColor}` : 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: activeTab === 'Student' ? activeColor : 'black',
              }}
            >
              Student
            </button>
            <button
              onClick={() => setActiveTab('Teacher')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === 'Teacher' ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'Teacher' ? `3px solid ${activeColor}` : 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: activeTab === 'Teacher' ? activeColor : 'black',
              }}
            >
              Teacher
            </button>
          </div>

          <div
            style={{
              width: '100%',
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {activeTab === 'Student' && (
              <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label htmlFor="nickname" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', textAlign: 'center', width: '100%' }}
                />
                {studentError && <p style={{ color: 'red', marginBottom: '1rem' }}>{studentError}</p>}
                <div style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
                  <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Grade Level:</label>
                  {['kinder', 'grade 1'].map((grade) => (
                    <label key={grade} style={{ marginRight: '1rem', textTransform: 'capitalize' }}>
                      <input
                        type="radio"
                        name="gradeLevel"
                        value={grade}
                        checked={gradeLevel === grade}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        style={{ marginRight: '0.25rem' }}
                      />
                      {grade}
                    </label>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
                  <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Section:</label>
                  {['1', '2', '3', '4'].map((sec) => (
                    <label key={sec} style={{ marginRight: '1rem' }}>
                      <input
                        type="radio"
                        name="section"
                        value={sec}
                        checked={section === sec}
                        onChange={(e) => setSection(e.target.value)}
                        style={{ marginRight: '0.25rem' }}
                      />
                      {sec}
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem',
                    backgroundColor: activeColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Submit
                </button>
              </form>
            )}

            {activeTab === 'Teacher' && (
              <form onSubmit={handleTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label htmlFor="username" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', width: '100%' }}
                />
                <label htmlFor="password" style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', width: '100%' }}
                />
                {teacherError && <p style={{ color: 'red', marginBottom: '1rem' }}>{teacherError}</p>}
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem',
                    backgroundColor: activeColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}
      >
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onClick={() => alert('Next button clicked')}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AIintro;

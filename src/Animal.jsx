import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DefaultHome.css';

function Animal() {
  const [selectedIcon, setSelectedIcon] = useState(null);

  const playDogBark = () => {
    const audio = new Audio('/dog-barking.mp3');
    audio.play();
  };

  const glowStyle = {
    boxShadow: '0 0 20px 5px #00ffff',
    borderRadius: '10px',
    transition: 'box-shadow 0.3s ease-in-out',
  };

  return (
    <div className="defaulthome-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center', padding: '20px', gap: '40px' }}>
      <Link to="/student">
        <img src="/back.png" alt="Back" style={{position: 'absolute', top: 10, left: 35, width: 60, height: 60, borderRadius: '50%', objectFit: 'cover'}} />
      </Link>

      {/* Top row with Speaker_Icon.svg */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img
          src="/Speaker_Icon.svg"
          alt="Speaker Icon"
          style={{ height: '30%', cursor: 'pointer' }}
          onClick={playDogBark}
        />
      </div>
      
      {/* Bottom row with dog-icon.png, cat-icon.png, pig-icon.png */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '30px' }}>
        <img
          src="/dog-icon.png"
          alt="Dog Icon"
          style={selectedIcon === 'dog' ? { ...glowStyle, height: '150px' } : { height: '150px' }}
          onClick={() => setSelectedIcon('dog')}
        />
        <img
          src="/cat-icon.png"
          alt="Cat Icon"
          style={selectedIcon === 'cat' ? { ...glowStyle, height: '150px' } : { height: '150px' }}
          onClick={() => setSelectedIcon('cat')}
        />
        <img
          src="/pig-icon.png"
          alt="Pig Icon"
          style={selectedIcon === 'pig' ? { ...glowStyle, height: '150px' } : { height: '150px' }}
          onClick={() => setSelectedIcon('pig')}
        />
      </div>
    </div>
  );
}

export default Animal;

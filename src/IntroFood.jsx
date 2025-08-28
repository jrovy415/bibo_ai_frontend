import { useState } from 'react';
import { Link } from 'react-router-dom';
import { speakText } from './ttsUtil';

const images = [
  { src: "/bread.png", alt: "Bread", category: "wiggle" },
  { src: "/rice.png", alt: "Rice", category: "wiggle" },
  { src: "/cereal.png", alt: "Cereal", category: "wiggle" },
  { src: "/potato.png", alt: "Potato", category: "wiggle" },
  { src: "/carrot.png", alt: "Carrot", category: "glow" },
  { src: "/broccoli.png", alt: "Broccoli", category: "glow" },
  { src: "/apple.png", alt: "Apple", category: "glow" },
  { src: "/orange.png", alt: "Orange", category: "glow" },
  { src: "/cheese.png", alt: "Cheese", category: "pulse" },
  { src: "/milk.png", alt: "Milk", category: "pulse" },
  { src: "/chicken.png", alt: "Chicken", category: "pulse" },
  { src: "/fish.png", alt: "Fish", category: "pulse" }
];

const groupSize = 4;

const IntroFood = () => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [wiggle, setWiggle] = useState(null);
  const [glow, setGlow] = useState(null);
  const [pulse, setPulse] = useState(null);

  // Group images by category
  const wiggleGroups = [];
  const glowGroups = [];
  const pulseGroups = [];

  for (let i = 0; i < images.length; i += groupSize) {
    const group = images.slice(i, i + groupSize);
    if (group[0].category === 'wiggle') wiggleGroups.push(group);
    else if (group[0].category === 'glow') glowGroups.push(group);
    else if (group[0].category === 'pulse') pulseGroups.push(group);
  }

  // Combine groups in order: wiggle, glow, pulse
  const allGroups = [...wiggleGroups, ...glowGroups, ...pulseGroups];

  const handlePrev = () => {
    setCurrentGroupIndex((prev) => (prev === 0 ? allGroups.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentGroupIndex((prev) => (prev === allGroups.length - 1 ? 0 : prev + 1));
  };

  const handleWiggle = (id) => {
    setWiggle(id);
    setTimeout(() => setWiggle(null), 500);
  };

  const handleGlow = (id) => {
    setGlow(id);
    setTimeout(() => setGlow(null), 500);
  };

  const handlePulse = (id) => {
    setPulse(id);
    setTimeout(() => setPulse(null), 500);
  };

  const handleImageClick = (image) => {
    speakText(image.alt);
    if (image.category === 'wiggle') {
      handleWiggle(image.alt);
    } else if (image.category === 'glow') {
      handleGlow(image.alt);
    } else if (image.category === 'pulse') {
      handlePulse(image.alt);
    }
  };

  const currentGroup = allGroups[currentGroupIndex] || [];

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    backgroundImage: "url('/3436801_20252.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const backForwardRowStyle = {
    marginBottom: '20px',
    position: 'relative',
    height: '100px',
  };

  const forwardArrowStyle = {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100px',
    height: '100px',
    cursor: 'pointer',
    transform: 'translateY(-50%)',
  };

  const backArrowStyle = {
    position: 'absolute',
    top: '50%',
    right: 0,
    width: '100px',
    height: '100px',
    cursor: 'pointer',
    transform: 'translateY(-50%)',
  };

  return (
    <div className="introfood-container" style={containerStyle}>
      {/* First set of arrows: Back and Forward */}
      <Link to="/Default">
        <img
          src="/back.png"
          alt="Back"
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        />
      </Link>
      <Link to="/FoodSp">
        <img
          src="/forward.png"
          alt="Forward"
          style={{
            position: 'absolute',
            top: '50%',
            right: 0,
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        />
      </Link>
      {/* Second set of arrows: Back2 and Forward2 */}
      <div
        className="back-forward-row"
        style={{
          ...backForwardRowStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        <img
          src="/back.png"
          alt="Back2"
          style={{ ...backArrowStyle, transform: 'translateY(-50%) rotate(0deg)' }}
          onClick={handlePrev}
        />
        <img
          src="/forward.png"
          alt="Forward2"
          style={{ ...forwardArrowStyle, transform: 'translateY(-50%) rotate(0deg)' }}
          onClick={handleNext}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <span
          style={{
            color: 'black',
            fontSize: '36px',
            fontWeight: 'bolder',
            marginBottom: '10px',
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {['GO Food', 'GLOW Food', 'GROW Food'][currentGroupIndex] || ''}
        </span>
        <div
          className="image-group"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '20px',
          }}
        >
          {currentGroup.map((img) => (
            <img
              key={img.alt}
              src={img.src}
              alt={img.alt}
              style={{ width: '200px', height: '200px', cursor: 'pointer', objectFit: 'contain' }}
              className={
                img.category === 'wiggle' && wiggle === img.alt
                  ? 'wiggle'
                  : img.category === 'glow' && glow === img.alt
                  ? 'glow'
                  : img.category === 'pulse' && pulse === img.alt
                  ? 'pulse'
                  : ''
              }
              onClick={() => handleImageClick(img)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroFood;

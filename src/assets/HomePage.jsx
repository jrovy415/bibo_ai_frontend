import { useState } from 'react';

const HomePage = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={styles.container}>
      <h1>Welcome to My React Page!</h1>
      <p>You clicked the button {count} times.</p>
      <button style={styles.button} onClick={() => setCount(count + 1)}>
        Click Me
      </button>
      <button style={styles.resetButton} onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f4',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    marginLeft: '10px',
  },
};

export default HomePage;

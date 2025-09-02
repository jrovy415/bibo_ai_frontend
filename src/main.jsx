import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/Animal" element={<Animal/>} />
        <Route path="/Default" element={<Default />} />
        <Route path="/login" element={<Login />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/IntroLetters" element={<IntroLetters />} />
        <Route path="/LetterSp" element={<LetterSp />} />
        <Route path="/letters" element={<Letters />} />
        <Route path="/IntroFood" element={<IntroFood />} />
        <Route path="/FoodSp" element={<FoodSp />} />
        <Route path="/FoodAct" element={<FoodAct />} />
        <Route path="/IntroEmo" element={<IntroEmo />} />
        <Route path="/EmoSp" element={<EmoSp />} />
        <Route path="/EmoAct" element={<EmoAct />} />
        <Route path="/TD2" element={<TD2 />} />
      </Routes>
    </BrowserRouter> */}
  </StrictMode>
);

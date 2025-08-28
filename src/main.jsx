import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx'
import Default from './DefaultHome.jsx'
import BaseDefault from './Default.jsx'; //this is a default page with the background
import IntroLetters from './IntroLetters.jsx';
import Letters from './Letters.jsx'; 
import IntroFood from './IntroFood.jsx';
import FoodSp from './FoodSp.jsx';
import FoodAct from './FoodAct.jsx';
import Weather from './Weather.jsx';
import Animal from './Animal.jsx'; 
import IntroEmo from './IntroEmo.jsx';
import EmoAct from './EmoAct.jsx';
import EmoSp from './EmoSp.jsx';
import LetterSp from './LetterSp.jsx';
import TD2 from './TD2.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
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
    </BrowserRouter>
  </StrictMode>
);

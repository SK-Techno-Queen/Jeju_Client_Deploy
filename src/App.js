import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './JejuBus/Main';
import Map from './JejuBus/KakaoMap';
import Table from './JejuBus/Table';
import Broker from './JejuBus/Broker';

const App = () => {
  return (
    <Routes>
      <Route path="/main" element={<Main />} />
      <Route path="/map" element={<Map />} />
      <Route path="/table" element={<Table />} />
      <Route path="/" element={<Main />} />
      <Route path="/botton" element={<Broker />} />
    </Routes>
  );
};

export default App;

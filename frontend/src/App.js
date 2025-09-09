import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardList from "./components/BoardList"; // Board listelerini gösteren component
import Board from "./components/Board"; // Seçilen board'un detaylarını ve listelerini gösteren component

function App() {
  return (
    // React Router ile sayfa yönlendirmeleri yapılacak
    <BrowserRouter>
      <Routes>
        {/* Anasayfa: Board listelerini gösterir */}
        <Route path="/" element={<BoardList />} />
        {/* Board detay sayfası: seçilen board ve kartlarını gösterir */}
        <Route path="/boards/:id" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

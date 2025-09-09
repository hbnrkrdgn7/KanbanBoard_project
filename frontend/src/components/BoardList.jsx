import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardService from "../services/boardService";
import "../style/BoardList.css";

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [boardName, setBoardName] = useState("");
  const navigate = useNavigate();

  // Component yüklendiğinde tüm boardları çek
  useEffect(() => {
    fetchBoards();
  }, []);

  // Backend'den tüm boardları çek
  const fetchBoards = async () => {
    try {
      const data = await BoardService.getAllBoards();
      setBoards(data); // State güncelle
    } catch (err) {
      console.error("Boards alınamadı:", err); 
    }
  };

  // Yeni board oluşturma fonksiyonu
  const createBoard = async () => {
    if (!boardName.trim()) return; // Boş board adıyla işlem yapma
    try {
      // Backend'e POST isteği at
      const res = await BoardService.createBoard({ name: boardName });
      setBoardName(""); // Inputu temizle
      fetchBoards(); // Board listesini tekrar çek
      navigate(`/boards/${res.board.id}`); 
    } catch (err) {
      console.error("Board oluşturulamadı:", err);
    }
  };

  // Board silme fonksiyonu
  const deleteBoard = async (id) => {
    if (!window.confirm("Bu boardu silmek istediğine emin misin?")) return;
    try {
      await BoardService.deleteBoard(id); // Backend'den sil
      fetchBoards(); // Listeyi güncelle
    } catch (err) {
      console.error("Board silinemedi:", err);
    }
  };

  // Board adını düzenleme fonksiyonu
  const editBoard = async (board) => {
    const newName = prompt("Yeni board adını girin:", board.name);
    if (!newName || !newName.trim()) return; // Boş isimle işlem yapma
    try {
      await BoardService.updateBoard(board.id, { name: newName }); // Backend'de güncelle
      fetchBoards(); // Listeyi güncelle
    } catch (err) {
      console.error("Board güncellenemedi:", err);
    }
  };

  return (
    <div className="board-list-container">
      <h1>Kanban Boards</h1>

      {/* Yeni board input ve create butonu */}
      <input
        type="text"
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
        placeholder="Board adı girin"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            createBoard();
          }
        }}
      />
      <button onClick={createBoard}>Create</button>

      {/* Board listesini göster */}
      <ul>
        {boards.map((b) => (
          <li
            key={b.id}
            className="board-list-item"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            {/* Board adına tıklandığında detay sayfasına git */}
            <span
              style={{ cursor: "pointer", flex: 1 }}
              onClick={() => navigate(`/boards/${b.id}`)}
            >
              {b.name}
            </span>

            {/* Düzenle ve sil butonları */}
            <div style={{ display: "flex", gap: "5px" }}>
              <button onClick={() => editBoard(b)} title="Düzenle">✏️</button>
              <button
                onClick={() => deleteBoard(b.id)}
                title="Sil"
                style={{ backgroundColor: "#dc3545", color: "white" }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardList;

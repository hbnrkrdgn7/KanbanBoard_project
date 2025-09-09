import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BoardService from "../services/boardService"; // Board ile ilgili API çağrıları
import CardService from "../services/cardService";   // Card ile ilgili API çağrıları
import CardModal from "./CardModal";                 // Kart ekleme/düzenleme modalı
import "../style/Board.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"; // Drag & Drop için

function Board() {
  const { id } = useParams(); // URL'deki board id'si
  const navigate = useNavigate(); // Sayfa yönlendirme

  // State'ler
  const [allBoards, setAllBoards] = useState([]); 
  const [board, setBoard] = useState(null);       
  const [lists, setLists] = useState([]);         
  const [editingCard, setEditingCard] = useState(null); 
  const [showModal, setShowModal] = useState(false);    
  const [activeListId, setActiveListId] = useState(null); 
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); 
  const [recentBoards, setRecentBoards] = useState([]); // Son gezilen boardlar

  useEffect(() => {
    fetchAllBoards(); // Tüm boardları al
    fetchBoard();     // Seçili board ve listeleri al

    // Pencere boyutu değişince sidebar durumunu ayarla
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [id]);

  // Board işlemleri
  const fetchAllBoards = async () => {
    try {
      const data = await BoardService.getAllBoards();
      setAllBoards(data);
    } catch (err) {
      console.error("Boardlar alınamadı:", err);
    }
  };

  const fetchBoard = async () => {
    try {
      const data = await BoardService.getBoardById(id);
      setBoard(data.board);
      setLists(data.lists);

      // Son gezilen boardları localStorage'dan al
      const stored = JSON.parse(localStorage.getItem("recentBoards")) || [];
      const updated = [data.board, ...stored.filter(b => b.id !== data.board.id)];
      const sliced = updated.slice(0, 5); // En fazla 5 board sakla
      setRecentBoards(sliced);
      localStorage.setItem("recentBoards", JSON.stringify(sliced));
    } catch (err) {
      console.error("Board detayları alınamadı:", err);
    }
  };

  // Kart işlemleri
  const handleAddCard = async ({ title, description, listId, color }) => {
    if (!title.trim()) return; // Boş başlık ekleme
    try {
      const newCard = await CardService.addCard({ list_id: listId, title, description, color });
      setLists(prevLists =>
        prevLists.map(list =>
          list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        )
      );
    } catch (err) {
      console.error("Kart eklenemedi:", err);
    }
  };

  const handleUpdateCard = async (updatedCard) => {
    try {
      const res = await CardService.updateCard(updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        color: updatedCard.color,
        list_id: updatedCard.listId
      });
      setLists(prevLists =>
        prevLists.map(list =>
          list.id === updatedCard.listId
            ? { ...list, cards: list.cards.map(c => c.id === updatedCard.id ? res : c) }
            : list
        )
      );
    } catch (err) {
      console.error("Kart güncellenemedi:", err);
    }
  };

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await CardService.deleteCard(cardId);
      setLists(prevLists =>
        prevLists.map(list =>
          list.id === listId
            ? { ...list, cards: list.cards.filter(c => c.id !== cardId) }
            : list
        )
      );
    } catch (err) {
      console.error("Kart silinemedi:", err);
    }
  };

  // Drag & Drop işlemi
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) return;

    const newLists = [...lists];
    const sourceList = newLists.find(l => l.id.toString() === source.droppableId);
    const destList = newLists.find(l => l.id.toString() === destination.droppableId);
    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);
    setLists(newLists);

    try {
      await CardService.updateCard(draggableId, {
        ...movedCard,
        list_id: destList.id,
        position: destination.index + 1
      });
    } catch (err) {
      console.error("Kart taşınamadı:", err);
    }
  };

  if (!board) return <div>Loading...</div>;

  return (
    <div className="board-container">
      {/* Hamburger menü */}
      <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {sidebarOpen && (
          <div className="sidebar-list">
            <h3>Boardlar</h3>
            <ul>
              {allBoards.map((b) => (
                <li
                  key={b.id}
                  onClick={() => navigate(`/boards/${b.id}`)}
                  className={b.id === Number(id) ? "active" : ""}
                >
                  {b.name}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/")}>Çıkış</button>
          </div>
        )}
      </div>

      {/* Board içeriği */}
      <div className={`board-content ${sidebarOpen ? "shifted" : ""}`}>
        <h1>{board.name}</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="lists-container">
            {lists.map(list => (
              <Droppable key={list.id} droppableId={String(list.id)}>
                {(provided) => (
                  <div className="list" ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="list-header">
                      <h3>{list.name}</h3>
                      <button onClick={() => { setActiveListId(list.id); setEditingCard(null); setShowModal(true); }}>+</button>
                    </div>

                    {list.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided) => (
                          <div className="card"
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               style={{ backgroundColor: card.color || "#9a09d7ff", ...provided.draggableProps.style }}>
                            <div>
                              <strong>{card.title}</strong>
                              <p>{card.description}</p>
                            </div>
                            <div className="card-actions">
                              <button onClick={() => { setActiveListId(list.id); setEditingCard(card); setShowModal(true); }}>✏️</button>
                              <button onClick={() => handleDeleteCard(card.id, list.id)}>🗑️</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Kart modalı */}
      <CardModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingCard(null); }}
        onSave={editingCard ? handleUpdateCard : handleAddCard}
        listId={activeListId}
        card={editingCard}
      />

      {/* Son Gezilenler kutusu */}
      <div className="recent-boards">
        <h4>Son Gezilenler</h4>
        <ul>
          {recentBoards.map(b => (
            <li key={b.id} onClick={() => navigate(`/boards/${b.id}`)}>
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Board;

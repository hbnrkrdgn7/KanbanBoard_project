import API from "../api"; 
const API_URL = "http://localhost:4000"; // Backend API adresi

const boardService = {
  // Tüm boardları backend'den çek
  getAllBoards: async () => {
    const res = await API.get("/boards"); 
    return res.data; 
  },

  // ID'ye göre tek board ve listelerini getir
  getBoardById: async (id) => {
    const res = await API.get(`/boards/${id}`); 
    return res.data; 
  },

  // Yeni board oluştur
  createBoard: async (boardData) => {
    const res = await API.post("/boards", boardData); 
    return res.data; 
  },

  // Mevcut boardu güncelle
  updateBoard: async (id, boardData) => {
    const res = await API.put(`/boards/${id}`, boardData); 
    return res.data; 
  },

  // Boardu sil
  deleteBoard: async (id) => {
    const res = await API.delete(`/boards/${id}`); 
    return res.data; 
  },
};

export default boardService; 

import API from "../api"; 

const cardService = {
  // Yeni kart ekle
  addCard: async (cardData) => {
    const res = await API.post("/cards", cardData);
    return res.data; 
  },

  // Mevcut kartı güncelle
  updateCard: async (id, cardData) => {
    const res = await API.put(`/cards/${id}`, cardData);
    return res.data; 
  },

  // Kartı sil
  deleteCard: async (id) => {
    const res = await API.delete(`/cards/${id}`); 
    return res.data; 
  },
};

export default cardService;

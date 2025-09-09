import React, { useState, useEffect, useRef } from "react";
import "../style/CardModal.css";

function CardModal({ show, onClose, onSave, listId, card }) {
  // Kart başlığı, açıklaması ve rengi için state
  const [title, setTitle] = useState(card ? card.title : "");
  const [description, setDescription] = useState(card ? card.description : "");
  const [color, setColor] = useState(card?.color);

  // Açıklama textarea'sına focus vermek için ref
  const descriptionRef = useRef(null);

  // Kart değiştiğinde veya modal açıldığında inputları güncelle
  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
    } else {
      // Yeni kart ekleme durumunda inputları sıfırla
      setTitle("");
      setDescription("");
     
    }
  }, [card, show]);

  // Modal kapalıysa render etme
  if (!show) return null;

  // Kaydet / Güncelle butonu fonksiyonu
  const handleSubmit = () => {
    if (!title.trim()) return; // Boş başlıkla işlem yapma
    // onSave fonksiyonunu çağır ve kart bilgilerini gönder
    onSave({ id: card?.id, title, description, listId, color });
    // Inputları sıfırla
    setTitle("");
    setDescription("");
    onClose(); // Modalı kapat
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal başlığı: Düzenle veya Yeni Kart */}
        <h3>{card ? "Kartı Düzenle" : "Yeni Kart Ekle"}</h3>

        {/* Kart başlığı inputu */}
        <input
          type="text"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              descriptionRef.current?.focus(); // Enter ile descriptiona geç
            }
          }}
        />

        {/* Kart açıklaması textarea */}
        <textarea
          ref={descriptionRef}
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Renk seçici */}
        <label>Renk Seç:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        {/* Modal butonları */}
        <div className="modal-actions">
          <button onClick={onClose}>İptal</button>
          <button onClick={handleSubmit}>{card ? "Güncelle" : "Ekle"}</button>
        </div>
      </div>
    </div>
  );
}

export default CardModal;

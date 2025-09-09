
# Kanban Project

Node.js, Express ve PostgreSQL backend ile React frontend kullanılarak geliştirilmiş bir Kanban uygulamasıdır. Board, list ve kart yönetimi yapılabilir; kartlar drag & drop ile listeler arasında taşınabilir.

---

## Proje Yapısı

kanban-project/
- backend/ # Node.js + Express API
- frontend/ # React uygulaması
- postman/ # Postman collection dosyası
- README.md


---

## Backend

- CRUD işlemleri: Board, List ve Card
- Örnek endpointler:
  - `GET /boards` → Tüm boardlar
  - `GET /boards/:id` → Board detayları ve listeler
  - `POST /boards` → Yeni board + default listeler
  - `PUT /boards/:id` → Board güncelle
  - `DELETE /boards/:id` → Board sil
  - `POST /cards` → Kart ekle
  - `PUT /cards/:id` → Kart güncelle
  - `DELETE /cards/:id` → Kart sil

---

## Frontend

- React ile geliştirilmiştir.
- Ana componentler:
  - `Board.jsx` → Board detayları
  - `BoardList.jsx` → Tüm boardlar
  - `CardModal.jsx` → Kart ekleme/düzenleme modelı

---

## Postman

- API endpointleri `postman/KanbanAPI.postman_collection.json` dosyasında mevcuttur.
- Dosya import edilerek test edilebilir.

---

## Kurulum

### Backend
```bash
cd backend
npm install
npm start

### Frontend
cd frontend
npm install
npm start

Frontend: http://localhost:3000
Backend: http://localhost:4000



require("dotenv").config(); // .env dosyasındaki ortam değişkenlerini yükle
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL bağlantısı

// Modelleri ekle (veri dönüşümlerini kolaylaştırmak için)
const Board = require("./models/Board");
const List = require("./models/List");
const Card = require("./models/Card");

const app = express();
app.use(cors()); // CORS izinleri
app.use(express.json()); // JSON verilerini parse et

app.get("/", (req, res) => {
  res.send("Kanban API Çalışıyor"); // API'nin çalıştığını test etmek için
});

// ---------------------- Board Routes ----------------------

// Tüm boardları listele
app.get("/boards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM boards ORDER BY id");
    const boards = result.rows.map(row => new Board(row)); // Board modeline dönüştür
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Tek board ve altındaki listeleri çek
app.get("/boards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const boardResult = await pool.query("SELECT * FROM boards WHERE id = $1", [id]);
    if (boardResult.rows.length === 0) return res.status(404).json({ error: "Board not found" });

    const board = new Board(boardResult.rows[0]);

    // Board altındaki listeleri ve her listin kartlarını çek
    const listsResult = await pool.query(
      "SELECT * FROM lists WHERE board_id = $1 ORDER BY position",
      [id]
    );

    const lists = await Promise.all(
      listsResult.rows.map(async (listRow) => {
        const list = new List(listRow);

        const cardsResult = await pool.query(
          "SELECT * FROM cards WHERE list_id = $1 ORDER BY position",
          [list.id]
        );

        list.cards = cardsResult.rows.map(cardRow => new Card(cardRow));
        return list;
      })
    );

    res.json({ board, lists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Yeni board ekle ve default listeleri oluştur
app.post("/boards", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Transaction başlat
    const { name } = req.body;

    const boardResult = await client.query(
      "INSERT INTO boards (name) VALUES ($1) RETURNING *",
      [name]
    );
    const board = new Board(boardResult.rows[0]);
    const boardId = board.id;

    // Default listeler oluştur
    const defaultLists = ["Backlog", "To Do", "In Progress", "Done"];
    for (let i = 0; i < defaultLists.length; i++) {
      await client.query(
        "INSERT INTO lists (board_id, name, position) VALUES ($1, $2, $3)",
        [boardId, defaultLists[i], i + 1]
      );
    }

    await client.query("COMMIT"); // Transaction tamamla

    // Default listeleri nesne olarak döndür
    const listsResponse = defaultLists.map((name, i) => new List({ id: i + 1, board_id: boardId, name, position: i + 1 }));
    res.status(201).json({ board, lists: listsResponse });
  } catch (err) {
    await client.query("ROLLBACK"); // Hata durumunda geri al
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Board güncelle
app.put("/boards/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE boards SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Board bulunamadı" });
    const board = new Board(result.rows[0]);
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Board sil
app.delete("/boards/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Board altındaki listeleri ve kartları sil
    const listsResult = await client.query("SELECT id FROM lists WHERE board_id = $1", [id]);
    for (const list of listsResult.rows) {
      await client.query("DELETE FROM cards WHERE list_id = $1", [list.id]);
    }
    await client.query("DELETE FROM lists WHERE board_id = $1", [id]);

    const boardResult = await client.query("DELETE FROM boards WHERE id = $1 RETURNING *", [id]);
    await client.query("COMMIT");

    if (boardResult.rows.length === 0) return res.status(404).json({ error: "Board bulunamadı" });

    const board = new Board(boardResult.rows[0]);
    res.json({ message: "Board silindi", board });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------- Card Routes ----------------------

// Yeni kart ekle
app.post("/cards", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { list_id, title, description, color } = req.body;

    // Yeni kartın pozisyonunu belirle (listenin sonuna ekle)
    const posResult = await client.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS position FROM cards WHERE list_id = $1",
      [list_id]
    );
    const position = posResult.rows[0].position;

    const cardResult = await client.query(
      "INSERT INTO cards (list_id, title, description, position, color) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [list_id, title, description || "", position, color]
    );

    await client.query("COMMIT");
    const card = new Card(cardResult.rows[0]);
    res.status(201).json(card);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Kart güncelle
app.put("/cards/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, color, list_id, position } = req.body;
  try {
    const result = await pool.query(
      "UPDATE cards SET title=$1, description=$2, color=$3, list_id=COALESCE($4, list_id), position=COALESCE($5, position) WHERE id=$6 RETURNING *",
      [title, description, color, list_id, position, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Kart bulunamadı" });
    const card = new Card(result.rows[0]);
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Kart sil
app.delete("/cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM cards WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Kart bulunamadı" });
    const card = new Card(result.rows[0]);
    res.json({ message: "Kart silindi", card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- Server Başlat ----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));

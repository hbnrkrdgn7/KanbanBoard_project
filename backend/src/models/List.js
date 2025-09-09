// List modeli: Veritabanından gelen liste verilerini nesne olarak temsil eder
class List {
  constructor({ id, board_id, name, position }) {
    this.id = id;             
    this.boardId = board_id;   
    this.name = name;         
    this.position = position; 
    this.cards = [];           
  }
}

module.exports = List;
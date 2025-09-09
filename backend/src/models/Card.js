// Card modeli: Veritabanından gelen kart verilerini nesne olarak temsil eder
class Card {
  constructor({ id, list_id, title, description, position, color }) {
    this.id = id;                     
    this.listId = list_id;            
    this.title = title;              
    this.description = description || ""; 
    this.position = position;         
    this.color = color; 
  }
}

module.exports = Card;

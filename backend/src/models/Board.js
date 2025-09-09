// Board modeli: Veritabanından gelen board verilerini nesne olarak temsil eder
class Board {
  constructor({ id, name }) {
    this.id = id;     
    this.name = name;
  }
}

module.exports = Board; 

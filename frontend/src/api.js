import axios from "axios";

// Axios instance oluşturuluyor, tüm API istekleri bu baseURL üzerinden yapılacak
const API = axios.create({
  baseURL: "http://localhost:4000", // Backend sunucusunun adresi ve portu
});

export default API; 

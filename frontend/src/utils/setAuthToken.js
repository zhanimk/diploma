import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    // Применяем токен авторизации к каждому запросу, если пользователь вошел в систему
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Удаляем заголовок авторизации, если пользователь вышел
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;

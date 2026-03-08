import React from 'react';
import { useSelector } from 'react-redux';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Профиль пользователя</h1>
      {user ? (
        <div>
          <p><strong>Имя:</strong> {user.firstName}</p>
          <p><strong>Фамилия:</strong> {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Загрузка данных пользователя...</p>
      )}
    </div>
  );
}

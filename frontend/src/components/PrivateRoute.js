import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const location = useLocation();

    // Если пользователь не аутентифицирован, отправляем на страницу входа
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Проверяем, есть ли у пользователя одна из требуемых ролей
    // `roles` - это массив ['athlete'], ['coach'] и т.д.
    if (roles && !roles.includes(user?.role)) {
        // Если роль не совпадает, можно перенаправить на главную или показать страницу "Доступ запрещен"
        return <Navigate to="/" replace />;
    }

    // Если все проверки пройдены, отображаем дочерний компонент
    return children;
};

export default PrivateRoute;

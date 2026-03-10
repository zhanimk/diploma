
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    // Redux store-дан `user` объектісін аламыз
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    // 1. Пайдаланушы жүйеге кірген бе және ол туралы ақпарат бар ма?
    if (!user) {
        // Егер жоқ болса, логин бетіне жібереміз
        // `state`-ке қайтып келу керек бетті сақтаймыз
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Пайдаланушының рөлі 'admin' бе?
    if (user.role !== 'admin') {
        // Егер админ болмаса, негізгі бетке жібереміз
        return <Navigate to="/" replace />;
    }

    // 3. Егер барлық тексеріс сәтті болса, сұралған компонентті көрсетеміз
    return children;
};

export default AdminRoute;

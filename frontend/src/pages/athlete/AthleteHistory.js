import React from 'react';
import { Link } from 'react-router-dom';
import '../Home/HomePage.css'; // Используем стили главной страницы
import './Dashboard.css'; // Стили для дашборда

const AthleteHistory = () => {
    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/tournaments">Мои турниры</Link></li>
                    <li><Link to="/athlete/history" className="active">История выступлений</Link></li>
                </ul>
            </nav>

            <div className="dashboard-content">
                <h2>История выступлений</h2>
                <div className="card">
                    <p>Здесь будет отображаться история ваших участий в турнирах и результаты.</p>
                    {/* В будущем здесь будет логика для отображения истории */}
                </div>
            </div>
        </div>
    );
};

export default AthleteHistory;

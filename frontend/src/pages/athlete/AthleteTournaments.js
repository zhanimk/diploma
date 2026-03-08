import React from 'react';
import { Link } from 'react-router-dom';
import '../Home/HomePage.css'; // Используем стили главной страницы
import './Dashboard.css'; // Стили для дашборда

const AthleteTournaments = () => {
    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/tournaments" className="active">Мои турниры</Link></li>
                    <li><Link to="/athlete/history">История выступлений</Link></li>
                </ul>
            </nav>

            <div className="dashboard-content">
                <h2>Мои турниры</h2>
                <div className="card">
                    <p>Здесь будет отображаться список предстоящих турниров, на которые вы можете зарегистрироваться.</p>
                    {/* В будущем здесь будет логика для отображения турниров */}
                </div>
            </div>
        </div>
    );
};

export default AthleteTournaments;

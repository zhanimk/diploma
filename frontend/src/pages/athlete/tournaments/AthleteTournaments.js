import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Mock данные для демонстрации
const MOCK_TOURNAMENTS = [
    {
        id: 1,
        name: 'Astana Grand Slam 2024',
        date: '28.08.2024',
        status: 'Тіркелген', // Registered
        statusCss: 'registered'
    },
     {
        id: 2,
        name: 'Kazakhstan National Championship',
        date: '15.09.2024',
        status: 'Күтілуде', // Pending
        statusCss: 'pending'
    },
     {
        id: 3,
        name: 'Taldykorgan Open',
        date: '01.10.2024',
        status: 'Ашық', // Open
        statusCss: 'open'
    },
];

const AthleteTournaments = () => {
    return (
        <div className="container dashboard-grid">
             <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/find-coach">Жаттықтырушыны табу</Link></li>
                    <li><Link to="/athlete/tournaments" className="active">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/history">Жарыс тарихы</Link></li>
                </ul>
            </nav>

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Менің турнирлерім</h2>
                    <p>Алдағы жарыстар, тіркелу статусы және турнирлік кестелер.</p>
                </header>

                <div className="card list-container">
                    <h3>Алдағы турнирлер</h3>
                    <ul className="tournaments-list">
                        {MOCK_TOURNAMENTS.map(item => (
                             <li key={item.id} className="tournament-item">
                                <div className="tournament-item__info">
                                    <span className="tournament-item__name">{item.name}</span>
                                    <span className="tournament-item__date">{item.date}</span>
                                </div>
                                <div className="tournament-item__actions">
                                    <span className={`status-badge ${item.statusCss}`}>{item.status}</span>
                                    <Link to={`/tournaments/${item.id}`} className="f-btn-link">Толығырақ</Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                 <div className="card">
                    <h3>Жаңа турнирге тіркелу</h3>
                    <p>Қазіргі уақытта тіркелу үшін ашық турнирлер жоқ. Жаңартуларды күтіңіз.</p>
                    {/* <button className="f-btn-main" disabled>Турнирлерді қарау</button> */}
                </div>
            </div>
        </div>
    );
};

export default AthleteTournaments;

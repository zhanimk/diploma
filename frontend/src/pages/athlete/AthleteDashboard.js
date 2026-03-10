import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AthleteDashboard.css'; 
import { User, Shield, Edit, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const ClubStatusCard = ({ profile, loading }) => {
    if (loading) {
        return <div className="item-card-placeholder"></div>;
    }

    let statusComponent;
    const clubName = profile?.club?.name || 'белгісіз клуб';

    switch (profile?.clubStatus) {
        case 'pending':
            statusComponent = (
                <div className="item-card status-pending">
                    <div className="item-card__icon"><Clock /></div>
                    <div className="item-card__info">
                        <h3>Сұраныс қаралуда</h3>
                        <p><strong>{clubName}</strong> клубына қосылу туралы сұранысыңыз жіберілді. Бапкердің жауабын күтіңіз.</p>
                    </div>
                </div>
            );
            break;
        case 'approved':
            statusComponent = (
                <div className="item-card status-approved">
                    <div className="item-card__icon"><CheckCircle /></div>
                    <div className="item-card__info">
                        <h3>Сіз клуб мүшесісіз</h3>
                        <p>Сіз <strong>{clubName}</strong> клубының мүшесі ретінде расталдыңыз.</p>
                    </div>
                </div>
            );
            break;
        case 'rejected':
            statusComponent = (
                <div className="item-card status-rejected">
                    <div className="item-card__icon"><XCircle /></div>
                    <div className="item-card__info">
                        <h3>Сұраныс қабылданбады</h3>
                        <p><strong>{clubName}</strong> клубына қосылу туралы сұранысыңыз қабылданбады. Басқа клубты қарастырсаңыз болады.</p>
                    </div>
                </div>
            );
            break;
        default:
            statusComponent = (
                <div className="item-card status-unknown">
                    <div className="item-card__icon"><HelpCircle /></div>
                    <div className="item-card__info">
                        <h3>Клуб таңдалмаған</h3>
                        <p>Сіз ешқандай клубқа тіркелмегенсіз. Профильді жаңарту қажет болуы мүмкін.</p>
                    </div>
                </div>
            );
    }

    return statusComponent;
}

const AthleteDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // This endpoint now populates club information
                const { data } = await axios.get('/api/users/profile');
                setProfile(data);
            } catch (error) {
                console.error("Профиль деректерін алу қатесі:", error);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    return (
        <div className="container athlete-dashboard-grid">
            <nav className="athlete-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard" className="active">Басты бет</Link></li>
                    <li><Link to="/profile">Профильді өңдеу</Link></li>
                    <li><Link to="/athlete/my-tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/results">Нәтижелер тарихы</Link></li>
                </ul>
            </nav>

            <main className="athlete-dashboard-content">
                <header className="page-header">
                    <h1>Сәлем, {user ? user.firstName : 'Спортшы'}!</h1>
                    <p>Жеке кабинетке қош келдіңіз. Мұнда сіз өзіңіздің спорттық мансабыңызды басқара аласыз.</p>
                </header>

                <div className="list-container">
                    {/* Club Status Card */}
                    <ClubStatusCard profile={profile} loading={loading} />

                    {/* Profile Card */}
                    <div className="item-card">
                        <div className="item-card__info">
                            <h3><User size={18} /> Жеке деректер</h3>
                            <p>Жеке ақпаратыңызды қарап шығыңыз және жаңартыңыз.</p>
                        </div>
                        <Link to="/profile" className="btn btn-primary">
                            <Edit size={16} />
                            Профильді өңдеу
                        </Link>
                    </div>

                    {/* Tournaments Card */}
                    <div className="item-card">
                       <div className="item-card__info">
                           <h3><Shield size={18} /> Менің турнирлерім</h3>
                           <p>Алдағы және өткен жарыстарды қарап шығыңыз.</p>
                       </div>
                       <Link to="/athlete/my-tournaments" className="btn btn-primary">
                            Турнирлерді көру
                       </Link>
                   </div>
                </div>
            </main>
        </div>
    );
};

export default AthleteDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AthleteDashboard.css'; 
import { User, Shield, Edit, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { setUser } from '../../store/authSlice';

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
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            // Add cache-control headers to prevent browser caching
            const { data } = await axios.get('/api/users/profile', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });
            dispatch(setUser(data)); 
        } catch (error) {
            console.error("Профиль деректерін алу қатесі:", error);
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    }, [dispatch, loading]);

    useEffect(() => {
        fetchProfile();

        let intervalId = null;
        // Only poll if the status is explicitly pending
        if (user?.clubStatus === 'pending') {
            intervalId = setInterval(fetchProfile, 5000); // Poll every 5 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [user?.clubStatus, fetchProfile]);

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
                    <ClubStatusCard profile={user} loading={loading} />

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

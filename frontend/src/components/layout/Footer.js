import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchFooterSettings } from '../../store/footerSlice';
import './Footer.css';

const Footer = () => {
    const dispatch = useDispatch();
    const { settings, loading, error } = useSelector(state => state.footer);
    const { userInfo } = useSelector(state => state.auth);

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // 1. Загружаем основные настройки футера (текст, ссылки и т.д.)
    useEffect(() => {
        if (!settings) {
            dispatch(fetchFooterSettings());
        }
    }, [dispatch, settings]);

    // 2. Если пользователь админ, загружаем живую статистику
    useEffect(() => {
        const fetchStats = async () => {
            // Выполняем запрос, только если есть настройки и пользователь админ
            if (settings && userInfo && userInfo.isAdmin) {
                setStatsLoading(true);
                try {
                    // Настраиваем axios для отправки токена
                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    const { data } = await axios.get('/api/dashboard/stats', config);
                    setStats(data);
                } catch (err) {
                    console.error('Не удалось загрузить статистику для виджета:', err);
                    // В случае ошибки просто не будем показывать статистику
                    setStats(null); 
                } finally {
                    setStatsLoading(false);
                }
            }
        };
        
        fetchStats();

    }, [settings, userInfo]); // Перезапускаем, если изменился пользователь или загрузились настройки


    // --- Рендеринг ---

    if (loading || !settings) {
        return <div className="kz-footer-placeholder"></div>; // Простая заглушка
    }

    if (error) {
        return null; // или компонент с ошибкой
    }
    
    const { brand, nav, widget, bottom } = settings.footer;

    return (
        <footer className="kz-footer">
            <div className="kz-footer__grid-bg"></div>
            {bottom.watermark && <div className="kz-footer__watermark">{bottom.watermark}</div>}

            <div className="kz-footer__container">
                <main className="kz-footer__main">
                    {/* Brand Section */}
                    <div className="kz-footer__brand">
                        {brand.logoText && <div className="kz-footer__logo" dangerouslySetInnerHTML={{ __html: brand.logoText }}></div>}
                        {brand.description && <p>{brand.description}</p>}
                    </div>

                    {/* Navigation Section */}
                    <nav className="kz-footer__nav">
                        {nav && nav.map((group, i) => (
                            <div key={i} className="nav-group">
                                <h4>{group.title}</h4>
                                <ul>
                                    {group.links && group.links.map((link, j) => (
                                        <li key={j}><Link to={link.url}>{link.text}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Widget Section */}
                    <div className="widget-card">
                        <div className="w-label">System Status</div>
                        <div className="w-status">
                            <div className={`pulse ${stats ? 'is-active' : ''}`}></div>
                            <span>{widget.statusText}</span>
                        </div>
                        {(stats && !statsLoading) && (
                             <div className="w-stats">
                                <div>
                                    <span>{stats.users}</span>
                                    <div>Пользователей</div>
                                </div>
                                <div>
                                    <span>{stats.clubs}</span>
                                    <div>Клубов</div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Bottom Section */}
                <div className="kz-footer__bottom">
                    <span>{bottom.copyrightText}</span>
                    <div className="b-links">
                        {bottom.links && bottom.links.map((link, i) => (
                            <Link key={i} to={link.url}>{link.text}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

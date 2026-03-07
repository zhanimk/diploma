import React from 'react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="kz-footer">
            <div className="kz-footer__grid-bg"></div>
            <div className="kz-footer__container">
                <div className="kz-footer__main">
                    <div className="kz-footer__brand">
                        <div className="kz-footer__logo">JUDO<span>ARENA</span></div>
                        <p>Турнирлерді басқарудың бірыңғай экожүйесі</p>
                        <div className="kz-footer__socials">
                            <a href="https://youtube.com" className="s-link">YT</a>
                            <a href="https://instagram.com" className="s-link">IN</a>
                            <a href="https://facebook.com" className="s-link">FB</a>
                        </div>
                    </div>
                    <nav className="kz-footer__nav">
                        <div className="nav-group">
                            <h4>Навигация</h4>
                            <a href="#top">Басты бет</a>
                            <a href="#about">Жоба туралы</a>
                            <a href="#skills">Техникалар</a>
                        </div>
                        <div className="nav-group">
                            <h4>Жарыстар</h4>
                            <a href="/results">Нәтижелер</a>
                            <a href="/schedule">Кесте</a>
                            <a href="/live">Тікелей эфир</a>
                        </div>
                    </nav>
                    <div className="widget-card">
                        <div className="w-label">System Status</div>
                        <div className="w-status">
                            <div className="pulse"></div>
                            All systems operational
                        </div>
                        <div className="w-stats">
                            <div><span>32</span>Online</div>
                            <div><span>4</span>Active</div>
                        </div>
                    </div>
                </div>
                <div className="kz-footer__bottom">
                    <p>© 2024 Judo-Arena. Барлық құқықтар қорғалған.</p>
                    <div className="b-links">
                        <a href="/terms">Пайдалану шарттары</a>
                        <a href="/privacy">Құпиялылық саясаты</a>
                    </div>
                </div>
            </div>
            <div className="kz-footer__watermark">JUDO-ARENA</div>
        </footer>
    );
}

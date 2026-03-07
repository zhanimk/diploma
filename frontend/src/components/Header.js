import React from 'react';
import './Header.css';

export default function Header() {
    return (
        <div className="header-space">
            <header className="futuristic-header">
                <div className="header-glow"></div>
                <div className="header-inner">
                    <a href="#top" className="f-logo">
                        <div className="f-logo__icon">
                            <div className="f-logo__dot"></div>
                        </div>
                        <div className="f-logo__text">
                            JUDO<span>ARENA</span>
                        </div>
                    </a>
                    <nav className="f-nav__pill">
                        <a href="#about" className="f-nav__item">Платформа туралы</a>
                        <a href="#skills" className="f-nav__item">Техникалар</a>
                        <a href="#top" className="f-nav__item active">Жарыстар</a>
                    </nav>
                    <div className="f-actions">
                        <a href="/login" className="f-btn-link">Кіру</a>
                        <a href="/register" className="f-btn-main">
                            <span>Тіркелу</span>
                        </a>
                    </div>
                </div>
            </header>
        </div>
    );
}

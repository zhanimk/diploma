import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { User, LogOut, Menu, X } from 'lucide-react'; // Импортируем иконки Menu и X
import './Header.css';

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
    setMobileMenuOpen(false); // Закрываем меню при выходе
  };

  let dashboardPath = '/';
  if (user) {
    switch (user.role) {
      case 'athlete': dashboardPath = '/athlete/dashboard'; break;
      case 'coach': dashboardPath = '/coach/dashboard'; break;
      case 'admin': dashboardPath = '/admin/dashboard'; break;
      case 'judge': dashboardPath = '/judge/dashboard'; break;
      default: dashboardPath = '/';
    }
  }

  // Эффект сжатия хедера при скролле
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header-space');
      if (window.scrollY > 20) {
        header.classList.add('is-compressed');
      } else {
        header.classList.remove('is-compressed');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="header-space">
        <header className="futuristic-header">
          <div className="header-glow"></div>
          <div className="header-inner">
            <Link to="/" className="f-logo">
              <div className="f-logo__icon">
                <div className="f-logo__dot"></div>
              </div>
              <div className="f-logo__text">JUDO<span>ARENA</span></div>
            </Link>
            
            <nav className="f-nav__pill">
              <Link to="/#about" className="f-nav__item">Платформа туралы</Link>
              <Link to="/#skills" className="f-nav__item">Техникалар</Link>
              <Link to="/" className="f-nav__item active">Жарыстар</Link>
            </nav>

            <div className="f-actions">
              {user ? (
                <div className="user-profile-menu">
                  <div className="profile-trigger">
                    <div className="profile-trigger__info">
                      <span className="profile-trigger__name">{user.firstName || 'Профиль'}</span>
                      <span className="profile-trigger__role">{user.role}</span>
                    </div>
                    <div className="profile-trigger__avatar">
                      <div className="avatar-placeholder"><User size={18} /></div>
                      <span className="online-badge"></span>
                    </div>
                  </div>
                  <div className="profile-dropdown">
                     <div className="dropdown-header">
                        <span className="profile-trigger__name">Сәлем, {user.firstName || 'пайдаланушы'}!</span>
                        <span className="profile-trigger__role">{user.role}</span>
                     </div>
                    <Link to={dashboardPath} className="dropdown-item">
                      <User size={16} />
                      <span>Басқару панелі</span>
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <LogOut size={16} />
                      <span>Шығу</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="f-btn-link">Кіру</Link>
                  <Link to="/register" className="f-btn-main"><span>Тіркелу</span></Link>
                </>
              )}
              
              {/* --- КНОПКА ГАМБУРГЕР --- */}
              <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* --- МОБИЛЬНОЕ МЕНЮ --- */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <button className="mobile-nav__close" onClick={() => setMobileMenuOpen(false)}>
            <X size={32} />
          </button>
          <div className="mobile-nav__links">
            <Link to="/#about" className="f-nav__item" onClick={() => setMobileMenuOpen(false)}>Платформа туралы</Link>
            <Link to="/#skills" className="f-nav__item" onClick={() => setMobileMenuOpen(false)}>Техникалар</Link>
            <Link to="/" className="f-nav__item active" onClick={() => setMobileMenuOpen(false)}>Жарыстар</Link>
            {!user && (
              <>
                <Link to="/login" className="f-nav__item" onClick={() => setMobileMenuOpen(false)}>Кіру</Link>
                <Link to="/register" className="f-btn-main" onClick={() => setMobileMenuOpen(false)}>Тіркелу</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

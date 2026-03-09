import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
// --- Иконки ---
import { User, LogOut, Menu, X, LayoutDashboard, Shield, Star, Award } from 'lucide-react'; 
import './Header.css'; // Будем переписывать этот файл

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
    setMobileMenuOpen(false); 
  };
  
  // --- Функция для определения пути к дашборду и цвета/иконки для роли ---
  const getRoleMeta = (role) => {
    switch (role) {
      case 'athlete': return { path: '/athlete/dashboard', color: 'blue', Icon: Award };
      case 'coach': return { path: '/coach/dashboard', color: 'gold', Icon: Star };
      case 'admin': return { path: '/admin/dashboard', color: 'teal', Icon: Shield };
      case 'judge': return { path: '/judge/dashboard', color: 'silver', Icon: User }; // Пример
      default: return { path: '/', color: 'default', Icon: User };
    }
  }

  const roleMeta = user ? getRoleMeta(user.role) : getRoleMeta(null);

  // --- Эффект сжатия хедера при скролле ---
  useEffect(() => {
    const handleScroll = () => {
      const headerSpace = document.querySelector('.header-space');
      if (headerSpace) {
          if (window.scrollY > 50) {
              headerSpace.classList.add('is-scrolled');
          } else {
              headerSpace.classList.remove('is-scrolled');
          }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 
        Этот div создает отступ, чтобы контент не заезжал под фиксированный хедер.
        Класс .is-scrolled будет добавляться при прокрутке.
      */}
      <div className="header-space">
        <header className="new-header">
          {/* Элементы для футуристичного дизайна */}
          <div className="new-header__bg"></div>
          <div className="new-header__grid-lines"></div>

          <div className="new-header__inner">
            <Link to="/" className="new-logo">
              <div className="new-logo__icon-wrap">
                <div className="new-logo__icon-bg"></div>
                <div className="new-logo__icon-dot"></div>
              </div>
              <div className="new-logo__text">JUDO<span>ARENA</span></div>
            </Link>
            
            {/* Навигация для десктопа */}
            <nav className="new-nav">
              <Link to="/#about" className="new-nav__item">Платформа</Link>
              <Link to="/#skills" className="new-nav__item">Техникалар</Link>
              <Link to="/tournaments" className="new-nav__item">Жарыстар</Link>
            </nav>

            <div className="new-actions">
              {user ? (
                // --- МЕНЮ ПРОФИЛЯ ---
                <div className="profile-menu" data-role-color={roleMeta.color}>
                  <div className="profile-menu__trigger">
                    <div className="profile-info">
                      <span className="profile-info__name">{user.firstName || 'Профиль'}</span>
                      <span className="profile-info__role">{user.role}</span>
                    </div>
                    <div className="avatar">
                        <div className="avatar__border"></div>
                        <div className="avatar__placeholder">
                            <roleMeta.Icon size={18} />
                        </div>
                    </div>
                  </div>

                  <div className="profile-menu__dropdown">
                     <div className="dropdown__header">
                        <span className="dropdown__greeting">Сәлем, {user.firstName || 'пайдаланушы'}!</span>
                        <span className="dropdown__email">{user.email}</span>
                     </div>
                     <div className="dropdown__divider"></div>
                     <Link to={roleMeta.path} className="dropdown__item">
                       <LayoutDashboard size={16} />
                       <span>Басқару панелі</span>
                     </Link>
                     <button onClick={handleLogout} className="dropdown__item is-logout">
                       <LogOut size={16} />
                       <span>Шығу</span>
                     </button>
                  </div>
                </div>
              ) : (
                // --- КНОПКИ ВХОДА И РЕГИСТРАЦИИ ---
                <div className="auth-buttons">
                  <Link to="/login" className="btn-secondary">Кіру</Link>
                  <Link to="/register" className="btn-primary"><span>Тіркелу</span></Link>
                </div>
              )}
              
              {/* --- КНОПКА ГАМБУРГЕР --- */}
              <button className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* --- МОБИЛЬНОЕ МЕНЮ --- */}
      {isMobileMenuOpen && (
        <nav className="mobile-fullscreen-nav">
          <button className="mobile-fullscreen-nav__close" onClick={() => setMobileMenuOpen(false)}>
            <X size={32} />
          </button>
          <div className="mobile-fullscreen-nav__links">
            <Link to="/#about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Платформа</Link>
            <Link to="/#skills" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Техникалар</Link>
            <Link to="/tournaments" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Жарыстар</Link>
            <div className="mobile-nav-divider"></div>
            {!user ? (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Кіру</Link>
                <Link to="/register" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>Тіркелу</Link>
              </>
            ) : (
                <>
                <Link to={roleMeta.path} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Басқару панелі</Link>
                <button onClick={handleLogout} className="mobile-nav-link is-logout">Шығу</button>
                </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice'; // Corrected path
// --- Иконки ---
import { User, LogOut, Menu, X, LayoutDashboard, Shield, Star, Award } from 'lucide-react'; 
import './Header.css';

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false); 
  };
  
  const getRoleMeta = (role) => {
    switch (role) {
      case 'athlete': return { path: '/athlete/dashboard', profilePath: '/athlete/profile', color: 'blue', Icon: Award };
      case 'coach': return { path: '/coach/dashboard', profilePath: '/coach/profile', color: 'gold', Icon: Star };
      case 'admin': return { path: '/admin/dashboard', profilePath: '/admin/dashboard', color: 'teal', Icon: Shield };
      default: return { path: '/', profilePath: '/', color: 'default', Icon: User };
    }
  }

  const roleMeta = user ? getRoleMeta(user.role) : getRoleMeta(null);

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
      <div class="header-space">
        <header class="new-header">
          <div class="new-header__bg"></div>
          <div class="new-header__grid-lines"></div>

          <div class="new-header__inner">
            <Link to="/" class="new-logo">
              <div class="new-logo__icon-wrap">
                <div class="new-logo__icon-bg"></div>
                <div class="new-logo__icon-dot"></div>
              </div>
              <div class="new-logo__text">JUDO<span>ARENA</span></div>
            </Link>
            
            <nav class="new-nav">
              <Link to="/#about" class="new-nav__item">Платформа</Link>
              <Link to="/#skills" class="new-nav__item">Техникалар</Link>
              <Link to="/tournaments" class="new-nav__item">Жарыстар</Link>
            </nav>

            <div class="new-actions">
              {user ? (
                <div class="profile-menu" data-role-color={roleMeta.color}>
                  <div class="profile-menu__trigger">
                    <div class="profile-info">
                      <span class="profile-info__name">{user.firstName || 'Профиль'}</span>
                      <span class="profile-info__role">{user.role}</span>
                    </div>
                    <div class="avatar">
                        <div class="avatar__border"></div>
                        <div class="avatar__placeholder"><roleMeta.Icon size={18} /></div>
                    </div>
                  </div>

                  <div class="profile-menu__dropdown">
                     <div class="dropdown__header">
                        <span class="dropdown__greeting">Сәлем, {user.firstName || 'пайдаланушы'}!</span>
                        <span class="dropdown__email">{user.email}</span>
                     </div>
                     <div class="dropdown__divider"></div>
                     <Link to={roleMeta.path} class="dropdown__item">
                       <LayoutDashboard size={16} />
                       <span>Басқару панелі</span>
                     </Link>
                     <Link to={roleMeta.profilePath} class="dropdown__item">
                       <User size={16} />
                       <span>Профиль</span>
                     </Link>
                     <div class="dropdown__divider"></div>
                     <button onClick={handleLogout} class="dropdown__item is-logout">
                       <LogOut size={16} />
                       <span>Шығу</span>
                     </button>
                  </div>
                </div>
              ) : (
                <div class="auth-buttons">
                  <Link to="/login" class="btn-secondary">Кіру</Link>
                  <Link to="/register" class="btn-primary"><span>Тіркелу</span></Link>
                </div>
              )}
              
              <button class="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {isMobileMenuOpen && (
        <nav class="mobile-fullscreen-nav">
          <button class="mobile-fullscreen-nav__close" onClick={() => setMobileMenuOpen(false)}>
            <X size={32} />
          </button>
          <div class="mobile-fullscreen-nav__links">
            <Link to="/#about" class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Платформа</Link>
            <Link to="/#skills" class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Техникалар</Link>
            <Link to="/tournaments" class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Жарыстар</Link>
            <div class="mobile-nav-divider"></div>
            {!user ? (
              <>
                <Link to="/login" class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Кіру</Link>
                <Link to="/register" class="btn-primary" onClick={() => setMobileMenuOpen(false)}>Тіркелу</Link>
              </>
            ) : (
                <>
                  <Link to={roleMeta.path} class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Басқару панелі</Link>
                  <Link to={roleMeta.profilePath} class="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>
                  <div class="mobile-nav-divider"></div>
                  <button onClick={handleLogout} class="mobile-nav-link is-logout">Шығу</button>
                </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
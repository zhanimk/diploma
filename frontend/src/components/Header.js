import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { User, LogOut, ChevronDown } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
    // Можно добавить перезагрузку, чтобы полностью очистить состояние, если необходимо
    // window.location.reload();
  };

  return (
    <div className="header-space">
      <header className="futuristic-header">
        <div className="header-glow"></div>
        <div className="header-inner">
          <Link to="/" className="f-logo">
            <div className="f-logo__icon">
              <div className="f-logo__dot"></div>
            </div>
            <div className="f-logo__text">
              JUDO<span>ARENA</span>
            </div>
          </Link>
          <nav className="f-nav__pill">
            <Link to="/#about" className="f-nav__item">Платформа туралы</Link>
            <Link to="/#skills" className="f-nav__item">Техникалар</Link>
            <Link to="/" className="f-nav__item active">Жарыстар</Link>
          </nav>
          <div className="f-actions">
            {user ? (
              <div 
                className="user-profile-menu" 
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="user-greeting">
                  <span>Сәлем, {user.firstName || 'пайдаланушы'}!</span>
                  <ChevronDown size={20} />
                </div>
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      <User size={16} />
                      <span>Профиль</span>
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <LogOut size={16} />
                      <span>Шығу</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="f-btn-link">Кіру</Link>
                <Link to="/register" className="f-btn-main">
                  <span>Тіркелу</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

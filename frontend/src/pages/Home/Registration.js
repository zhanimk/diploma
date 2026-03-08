import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { User, Mail, Lock, Eye, EyeOff, Medal, Briefcase, Shield, Phone, Calendar, MapPin } from "lucide-react";
import "./Auth.css";

export default function Register() {
  const [role, setRole] = useState("athlete"); // 'athlete' | 'coach'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [club, setClub] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const roleDescriptions = {
    athlete: {
      title: "СПОРТСМЕН",
      desc: "Участвуйте в соревнованиях, зарабатывайте рейтинг и побеждайте.",
      badge: "ATHLETE ACCESS",
    },
    coach: {
      title: "ТРЕНЕР",
      desc: "Управляйте своими спортсменами и отслеживайте их прогресс.",
      badge: "COACH ACCESS",
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password, role, phoneNumber, dateOfBirth, club, city }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Автоматический вход после успешной регистрации
        if (responseData.token) {
            localStorage.setItem('token', responseData.token);
        }
        dispatch(setUser(responseData));
        
        console.log(`Регистрация успешна! Роль: ${responseData.role}`);
        
        // Перенаправление в зависимости от роли
        if (responseData.role === "coach") {
          navigate("/coach/dashboard");
        } else {
          navigate("/profile");
        }
      } else {
        setError(responseData.message || "Произошла ошибка при регистрации.");
      }
    } catch (err) {
      console.error(err);
      setError("Системная ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
        <div className="auth-visual__bg"></div>
        <div className="auth-visual__content">
          <div className="brand-logo">
            JUDO<span>ARENA</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="quote-box"
            >
              <div className={`admin-badge badge-${role}`}>
                {role === "coach" ? <Briefcase size={18} /> : <Medal size={18} />}
                {roleDescriptions[role].badge}
              </div>
              <h1>{roleDescriptions[role].title}</h1>
              <p>{roleDescriptions[role].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Регистрация</h2>
            <p>Выберите свою роль в системе и присоединяйтесь</p>
          </div>

          {error && <div className="error-alert">⚠️ {error}</div>}

          <form onSubmit={handleRegister}>
            <div className="role-selector-grid">
              <div
                className={`role-option ${
                  role === "athlete" ? "selected" : ""
                }`}
                onClick={() => setRole("athlete")}
              >
                <div className="role-ico">
                  <Medal size={24} />
                </div>
                <div className="role-txt">
                  <span>Спортсмен</span>
                  <small>Участвовать в соревнованиях</small>
                </div>
              </div>

              <div
                className={`role-option ${role === "coach" ? "selected" : ""}`}
                onClick={() => setRole("coach")}
              >
                <div className="role-ico">
                  <Briefcase size={24} />
                </div>
                <div className="role-txt">
                  <span>Тренер</span>
                  <small>Управлять спортсменами</small>
                </div>
              </div>
            </div>

            <div className="form-fields">
              <div className="input-group">
                <div className="icon-wrapper">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ФИО (полностью)"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

                <div className="input-group">
                    <div className="icon-wrapper">
                        <Phone size={18} />
                    </div>
                    <input
                        type="tel"
                        placeholder="Номер телефона"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <div className="icon-wrapper">
                        <Calendar size={18} />
                    </div>
                    <input
                        type="date"
                        placeholder="Дата рождения"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <div className="icon-wrapper">
                        <MapPin size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Клуб"
                        required
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <div className="icon-wrapper">
                        <MapPin size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Город"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>

              <div className="input-group">
                <div className="icon-wrapper">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email почта"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <div className="icon-wrapper">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? "Регистрация..." : "Создать аккаунт"}
            </button>
          </form>

          <div className="auth-footer">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

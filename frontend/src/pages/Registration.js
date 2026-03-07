import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Medal, Briefcase } from "lucide-react";
import "./Auth.css";

export default function Register() {
  const [role, setRole] = useState("athlete"); // 'athlete' | 'coach'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const roleDescriptions = {
    athlete: {
      title: "СПОРТШЫ",
      desc: "Жарыстарға қатысып, рейтинг жинаңыз және жеңіске жетіңіз.",
      badge: "PLAYER ACCESS",
    },
    coach: {
      title: "ТРЕНЕР",
      desc: "Спортсмендеріңізді басқарып, олардың прогресін қадағалаңыз.",
      badge: "COACH ACCESS",
    },
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      if (response.ok) {
        console.log(`Тіркелу сәтті! Рөлі: ${role}`);
        if (role === "coach") {
          navigate("/coach/dashboard");
        } else {
          navigate("/profile");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Тіркелу кезінде қате пайда болды.");
      }
    } catch (err) {
      console.error(err);
      setError("Жүйелік қате: " + err.message);
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
                {role === "coach" ? (
                  <Briefcase size={18} />
                ) : (
                  <Medal size={18} />
                )}
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
            <h2>Тіркелу</h2>
            <p>Жүйедегі рөліңізді таңдап, қосылыңыз</p>
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
                  <span>Спортшы</span>
                  <small>Жарысқа қатысу</small>
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
                  <small>Спортсменді басқару</small>
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
                  placeholder="Аты-жөні (Толық)"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <div className="icon-wrapper">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email пошта"
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
                  placeholder="Құпия сөз"
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
              {loading ? "Тіркелуде..." : "Аккаунт жасау"}
            </button>
          </form>

          <div className="auth-footer">
            Аккаунтыңыз бар ма? <Link to="/login">Кіру</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

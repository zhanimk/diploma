import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import axios from 'axios'; 
import { User, Mail, Lock, Eye, EyeOff, Medal, Briefcase, Phone, Calendar, MapPin } from "lucide-react";
import "./Auth.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("athlete");

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
      title: "СПОРТШЫ",
      desc: "Жарыстарға қатысып, рейтинг жинап, жеңіске жетіңіз.",
      badge: "SPORTШЫ ҚОЛЖЕТІМДІЛІГІ",
    },
    coach: {
      title: "БАПКЕР",
      desc: "Спортшыларыңызды басқарып, олардың үлгерімін қадағалаңыз.",
      badge: "БАПКЕР ҚОЛЖЕТІМДІЛІГІ",
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const registrationData = {
            firstName,
            lastName,
            email,
            password,
            role, 
            phoneNumber,
            dateOfBirth,
            club,
            city
        };

        const { data } = await axios.post("/api/users/register", registrationData);

        if (data && data.token && data.role) {
            localStorage.setItem('token', data.token);
            dispatch(setUser(data)); 
            
            if (data.role === "coach") {
                navigate("/coach/dashboard");
            } else {
                navigate("/athlete/dashboard");
            }
        } else {
            throw new Error('Тіркелуден кейін пайдаланушы деректерін алу мүмкін болмады.');
        }

    } catch (err) {
        console.error('Тіркелу қатесі:', err);
        const errorMessage = err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Жүйелік қате орын алды. Қайталап көріңіз.';
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="auth-header">
              <h2>Тіркелу</h2>
              <p>Жүйедегі рөліңізді таңдап, бізге қосылыңыз</p>
            </div>
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
                  <small>Жарыстарға қатысу</small>
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
                  <span>Бапкер</span>
                  <small>Спортшыларды басқару</small>
                </div>
              </div>
            </div>
            <div className="form-navigation">
              <div></div>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Келесі</button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="form-fields">
                <div className="input-group">
                    <div className="icon-wrapper"><User size={18} /></div>
                    <input type="text" placeholder="Толық аты-жөніңіз" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="input-group">
                    <div className="icon-wrapper"><Phone size={18} /></div>
                    <input type="tel" placeholder="Телефон нөмірі" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="input-group">
                    <div className="icon-wrapper"><Calendar size={18} /></div>
                    <input type="date" placeholder="Туған күні" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
            </div>
            <div className="form-navigation">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>Артқа</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Келесі</button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="form-fields">
                <div className="input-group">
                    <div className="icon-wrapper"><MapPin size={18} /></div>
                    <input type="text" placeholder="Клуб" required value={club} onChange={(e) => setClub(e.target.value)} />
                </div>
                <div className="input-group">
                    <div className="icon-wrapper"><MapPin size={18} /></div>
                    <input type="text" placeholder="Қала" required value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
            </div>
            <div className="form-navigation">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Артқа</button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>Келесі</button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="form-fields">
                <div className="input-group">
                    <div className="icon-wrapper"><Mail size={18} /></div>
                    <input type="email" placeholder="Email пошта" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <div className="icon-wrapper"><Lock size={18} /></div>
                    <input type={showPassword ? "text" : "password"} placeholder="Құпия сөз" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <div className="form-navigation">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Артқа</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Тіркелуде..." : "Аккаунт құру"}</button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
        <div className="auth-visual__bg"></div>
        <div className="auth-visual__content">
          <div className="brand-logo">JUDO<span>ARENA</span></div>
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
          <div className="progress-bar">
            <div className={`step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
              <div className="dot">1</div>
              <div className="label">Рөл</div>
            </div>
            <div className={`step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
              <div className="dot">2</div>
              <div className="label">Жеке деректер</div>
            </div>
            <div className={`step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
              <div className="dot">3</div>
              <div className="label">Клуб</div>
            </div>
            <div className={`step ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}>
              <div className="dot">4</div>
              <div className="label">Аккаунт</div>
            </div>
          </div>

          {error && <div className="error-alert">⚠️ {error}</div>}

          <form onSubmit={handleRegister}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </form>

          <div className="auth-footer">
            Аккаунтыңыз бар ма? <Link to="/login">Кіру</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';
import { User, Mail, Lock, Eye, EyeOff, Medal, Briefcase, Phone, Calendar, Weight, Users, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import "./Auth.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("athlete");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [club, setClub] = useState(""); // This will now store the CLUB ID
  
  // UI/UX states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data from API
  const [clubs, setClubs] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data } = await axios.get("/api/clubs");
        setClubs(data || []);
      } catch (err) {
        console.error("Failed to fetch clubs:", err);
        setError("Клубтар тізімін жүктеу мүмкін болмады.");
      }
    };
    fetchClubs();
  }, []);

  const roleDescriptions = {
    athlete: { title: "СПОРТШЫ", desc: "Жарыстарға қатысып, рейтинг жинап, жеңіске жетіңіз.", badge: "SPORTШЫ ҚОЛЖЕТІМДІЛІГІ" },
    coach: { title: "БАПКЕР", desc: "Спортшыларыңызды басқарып, олардың үлгерімін қадағалаңыз.", badge: "БАПКЕР ҚОЛЖЕТІМДІЛІГІ" }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (role === 'athlete' && !club) {
        setError("Please select a club.");
        setStep(3); // Go back to club selection step
        return;
    }

    setLoading(true);
    setError("");

    try {
        const registrationData = {
            firstName,
            lastName,
            email,
            password,
            role,
            gender,
            phoneNumber,
            dateOfBirth,
            weight: role === 'athlete' ? weight : undefined,
            club: role === 'athlete' ? club : undefined,
        };

        const { data } = await axios.post("/api/users/register", registrationData);

        if (data && data.token && data.role) {
            setAuthToken(data.token);
            dispatch(setUser(data));
            navigate(data.role === "coach" ? "/coach/dashboard" : "/athlete/dashboard");
        } else {
            throw new Error('Тіркелу кезінде қате кетті.');
        }

    } catch (err) {
        setError(err.response?.data?.message || 'Белгісіз қате пайда болды.');
    } finally {
        setLoading(false);
    }
  };
  
  const renderStep = () => {
    const motionProps = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3 } };
    
    switch (step) {
      case 1:
        return (
          <motion.div {...motionProps}>
            <div className="auth-header"><h2>Тіркелу</h2><p>Жүйедегі рөліңізді таңдаңыз</p></div>
            <div className="role-selector-grid">
                 <div className={`role-option ${role === "athlete" ? "selected" : ""}`} onClick={() => setRole("athlete")}><div className="role-ico"><Medal size={32} /></div><div className="role-txt"><span>Спортшы</span><small>Жарыстарға қатысу</small></div></div>
                 <div className={`role-option ${role === "coach" ? "selected" : ""}`} onClick={() => setRole("coach")}><div className="role-ico"><Briefcase size={32} /></div><div className="role-txt"><span>Бапкер</span><small>Спортшыларды басқару</small></div></div>
            </div>
            <div className="form-navigation"><button type="button" className="btn btn-primary" onClick={nextStep}>Келесі <ArrowRight size={18}/></button></div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div {...motionProps}>
            <div className="auth-header"><h2>Жеке деректер</h2><p>Өзіңіз жайлы ақпаратты толтырыңыз</p></div>
            <div className="form-fields">
                <div className="input-group"><div className="icon-wrapper"><User size={20} /></div><input type="text" placeholder="Аты (Имя)" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                <div className="input-group"><div className="icon-wrapper"><User size={20} /></div><input type="text" placeholder="Тегі (Фамилия)" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                <div className="input-group gender-selection">
                    <div className="icon-wrapper"><Users size={20} /></div>
                    <div className="gender-options">
                        <label className={gender === 'male' ? 'active' : ''}><input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} /> Ер</label>
                        <label className={gender === 'female' ? 'active' : ''}><input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} /> Әйел</label>
                    </div>
                </div>
                <div className="input-group"><div className="icon-wrapper"><Phone size={20} /></div><input type="tel" placeholder="Телефон нөмірі" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /></div>
                <div className="input-group"><div className="icon-wrapper"><Calendar size={20} /></div><input type="date" placeholder="Туған күні" required={role === 'athlete'} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
            </div>
            <div className="form-navigation"><button type="button" className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={18}/> Артқа</button><button type="button" className="btn btn-primary" onClick={nextStep}>Келесі <ArrowRight size={18}/></button></div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div {...motionProps}>
             <div className="auth-header"><h2>Клуб & Салмақ</h2><p>Спорт клубыңызды және салмағыңызды көрсетіңіз</p></div>
            <div className="form-fields">
                {role === 'athlete' ? (
                    <>
                        <div className="input-group">
                            <div className="icon-wrapper"><Shield size={20} /></div>
                            <select required value={club} onChange={(e) => setClub(e.target.value)}>
                                <option value="" disabled>Спорт клубын таңдаңыз</option>
                                {clubs.length > 0 ? (
                                    clubs.map(c => <option key={c._id} value={c._id}>{c.name} ({c.city})</option>)
                                ) : (
                                    <option disabled>Клубтар жүктелуде...</option>
                                )}
                            </select>
                        </div>
                        <div className="input-group"><div className="icon-wrapper"><Weight size={20} /></div><input type="number" placeholder="Салмақ (кг)" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
                    </>
                ) : (
                    <p className="text-center info-text">Бапкер ретінде тіркелу үшін қосымша ақпарат қажет емес.</p>
                )}
            </div>
            <div className="form-navigation"><button type="button" className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={18}/> Артқа</button><button type="button" className="btn btn-primary" onClick={nextStep}>Келесі <ArrowRight size={18}/></button></div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div {...motionProps}>
            <div className="auth-header"><h2>Аккаунт</h2><p>E-mail және құпия сөзді орнатыңыз</p></div>
            <div className="form-fields">
                <div className="input-group"><div className="icon-wrapper"><Mail size={20} /></div><input type="email" placeholder="Электронды пошта" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="input-group">
                    <div className="icon-wrapper"><Lock size={20} /></div>
                    <input type={showPassword ? "text" : "password"} placeholder="Құпия сөз" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
            </div>
            <div className="form-navigation"><button type="button" className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={18}/> Артқа</button><button type="submit" className="submit-btn" style={{flexGrow: 1}} disabled={loading}>{loading ? <span className="loader-spin"></span> : "Аккаунт құру"}</button></div>
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
        <div className="brand-logo">JUDO<span>ARENA</span></div>
        <div className="auth-visual__content">
          <AnimatePresence mode="wait">
              <motion.div 
                key={role} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                transition={{ duration: 0.4 }}
              >
                <div className={`admin-badge badge-${role}`}>{role === "coach" ? <Briefcase size={20} /> : <Medal size={20} />}{roleDescriptions[role].badge}</div>
                <div className="quote-box">
                    <h1>{roleDescriptions[role].title}</h1>
                    <p>{roleDescriptions[role].desc}</p>
                </div>
            </motion.div>
            </AnimatePresence>
        </div>
      </div>
      <div className="auth-form-wrapper">
        <motion.div 
            className="auth-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <div className="progress-bar">
            <div className={`step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}><div className="dot">1</div><div className="label">Рөл</div></div>
            <div className={`step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}><div className="dot">2</div><div className="label">Деректер</div></div>
            <div className={`step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}><div className="dot">3</div><div className="label">Клуб</div></div>
            <div className={`step ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}><div className="dot">4</div><div className="label">Аккаунт</div></div>
          </div>
          <AnimatePresence>
            {error && <motion.div initial={{ height: 0, opacity: 0, marginBottom: 0 }} animate={{ height: "auto", opacity: 1, marginBottom: '2rem' }} exit={{ height: 0, opacity: 0, marginBottom: 0 }} className="error-alert">⚠️ {error}</motion.div>}
          </AnimatePresence>
          <form onSubmit={handleRegister}><AnimatePresence mode="wait">{renderStep()}</AnimatePresence></form>
          <div className="auth-footer">Аккаунтыңыз бар ма? <Link to="/login">Кіру</Link></div>
        </motion.div>
      </div>
    </div>
  );
}

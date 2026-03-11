
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/authSlice";
import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        switch (user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "judge":
            navigate("/judge/dashboard");
            break;
          case "coach":
            navigate("/coach/dashboard");
            break;
          default:
            navigate("/athlete/dashboard");
            break;
        }
      }, 500); 

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loginPromise = new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post("/api/users/login", { email, password });
        setAuthToken(data.token);
        dispatch(setUser(data));
        resolve(data);
      } catch (err) {
        const message = err.response?.data?.message || "Пошта немесе құпия сөз қате.";
        reject(message);
      }
    });

    toast.promise(loginPromise, {
       loading: 'Кіруде...',
       success: <b>Сәтті кірдіңіз!</b>,
       error: (err) => <b>{err.toString()}</b>,
     });

    try {
      await loginPromise;
    } catch(err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-visual login-visual">
        <div className="auth-visual__bg"></div>
        <div className="auth-visual__content">
          <div className="brand-logo">JUDO<span>ARENA</span></div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="quote-box"
          >
            <h1>
              ҚАЙТА ОРАЛУЫҢЫЗБЕН! <br /> ЧЕМПИОН
            </h1>
            <p>
              Жаңа жеңістер мен рекордтар сізді күтуде. Жүйеге кіріп, жаттығуды
              жалғастырыңыз.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <motion.div 
            className="auth-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h2>Жүйеге кіру</h2>
            <p>Деректерді енгізіп, жалғастырыңыз</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: '2.5rem' }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="error-alert"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin}>
            <div className="form-fields">
              <div className="input-group">
                <div className="icon-wrapper"><Mail size={20} /></div>
                <input
                  type="email"
                  placeholder="Электронды поштаңыз"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <div className="icon-wrapper"><Lock size={20} /></div>
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <Link to="/forgot" className="forgot-link-sm">
                Құпия сөзді ұмыттыңыз ба?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loader-spin"></span>
              ) : (
                <>
                  <LogIn size={20} />
                  Кіру
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Аккаунтыңыз жоқ па? <Link to="/register">Тіркелу</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

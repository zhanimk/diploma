import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import toast from 'react-hot-toast'; // Импортируем toast
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const loginPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
  
        if (response.ok) {
          const userData = await response.json();
  
          if (userData.token) {
            localStorage.setItem('token', userData.token);
          }
          dispatch(setUser(userData));
          
          // После всех успешных операций
          resolve(userData); 

          const role = userData.role;
  
          switch (role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "judge":
              navigate("/judge/dashboard");
              break;
            case "coach":
              navigate("/coach/dashboard");
              break;
            case "athlete":
              navigate("/profile");
              break;
            default:
              navigate("/profile");
              break;
          }
        } else if (response.status === 401) {
          reject("Пошта немесе құпия сөз қате.");
        } else {
          reject("Жүйелік қате орын алды.");
        }
      } catch (err) {
        console.error(err);
        reject("Жүйелік қате: " + err.message);
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
          <div className="brand-logo">
            JUDO<span>ARENA</span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
        <div className="auth-card">
          <div className="auth-header">
            <h2>Жүйеге кіру</h2>
            <p>Деректерді енгізіп, жалғастырыңыз</p>
          </div>

          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="error-alert"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin}>
            <div className="form-fields">
              <div className="input-group">
                <div className="icon-wrapper">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email поштаңыз"
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
                  Кіру <LogIn size={18} style={{ marginLeft: 8 }} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Аккаунтыңыз жоқ па? <Link to="/register">Тіркелу</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

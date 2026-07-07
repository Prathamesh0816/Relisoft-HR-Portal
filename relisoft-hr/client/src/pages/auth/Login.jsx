import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getTheme } from '../../config/themes';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const theme = useAuthStore((s) => s.theme);
  const slides = getTheme(theme).slides;
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@relisofttechnologies\.com$/.test(form.email)) errs.email = 'Only @relisofttechnologies.com emails allowed';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const userData = await login(form);
      useAuthStore.getState().login(userData, userData.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper)' }}>
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--moss) 25%, transparent), color-mix(in srgb, var(--copper) 15%, transparent))`,
        }}>
        {slides.map((slide, index) => (
          <div key={index} className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: index === activeSlide ? 1 : 0,
              transition: 'opacity 800ms ease',
            }}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain"
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--moss) 50%, transparent), color-mix(in srgb, var(--copper) 30%, transparent))',
              }} />
              <div className="absolute bottom-12 left-12 right-12">
                <h2 className="text-3xl font-bold text-white mb-2">{slide.title}</h2>
                <p className="text-lg text-white/80">{slide.tag}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-12 flex gap-2">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setActiveSlide(idx)}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: idx === activeSlide ? '32px' : '8px',
                background: idx === activeSlide ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[480px] flex items-center justify-center p-8" style={{ background: 'var(--panel)' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/assets/relisoft-logo.webp" alt="ReliSoft" className="h-14 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>ReliSoft HR</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="firstname.lastname"
                  className="input-field pl-10"
                  style={{ borderColor: errors.email ? 'var(--danger)' : 'var(--line)' }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  style={{ borderColor: errors.password ? 'var(--danger)' : 'var(--line)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--line)' }}>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Secure access for ReliSoft employees only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

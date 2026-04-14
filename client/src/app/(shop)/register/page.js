'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit mobile number';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');

    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (result.success) {
      router.push('/');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const passStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#22C55E'];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>⚡</span>
          <span className={styles.logoText}>Tech<span className={styles.logoGold}>Bharat</span></span>
        </div>

        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join 50,000+ Indian makers & engineers</p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name *</label>
            <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label>Email Address *</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" required />
          </div>
          <div className={styles.field}>
            <label>Mobile Number <span className={styles.optional}>(optional)</span></label>
            <input type="tel" className="input" placeholder="10-digit mobile" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} maxLength={10} />
          </div>
          <div className={styles.field}>
            <label>Password *</label>
            <div className={styles.passWrap}>
              <input type={showPass ? 'text' : 'password'} className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className={styles.strengthBar}>
                <div className={styles.strengthBars}>
                  {[1,2,3].map(l => (
                    <div key={l} className={styles.strengthSegment} style={{ background: passStrength >= l ? strengthColor[passStrength] : 'var(--navy-border)' }} />
                  ))}
                </div>
                <span style={{ color: strengthColor[passStrength], fontSize: '0.72rem', fontWeight: 600 }}>{strengthLabel[passStrength]}</span>
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label>Confirm Password *</label>
            <div className={styles.passWrap}>
              <input type={showPass ? 'text' : 'password'} className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              {form.confirmPassword && (
                <CheckCircle size={16} style={{ color: form.password === form.confirmPassword ? 'var(--success)' : 'var(--error)', position: 'absolute', right: 12 }} />
              )}
            </div>
          </div>

          <p className={styles.terms}>
            By creating an account, you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isLoading}>
            {isLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import styles from './Auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }

    const result = await login(form.email, form.password);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>⚡</span>
          <span className={styles.logoText}>Tech<span className={styles.logoGold}>Bharat</span></span>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your TechBharat account</p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <Link href="/forgot-password" className={styles.forgot}>Forgot password?</Link>
            </div>
            <div className={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isLoading}>
            {isLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

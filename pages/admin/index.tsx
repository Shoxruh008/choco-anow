import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login xato');
        return;
      }

      // Token ni localStorage ga saqlash
      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch {
      setError('Serverga ulanishda xato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Panel — Chocoa</title>
      </Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span>🍫</span>
            <h1>Admin Panel</h1>
            <p>Chocoa Do'koni</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="username">Login</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin login"
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Parol</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          <a href="/" className={styles.backLink}>← Saytga qaytish</a>
        </div>
      </div>
    </>
  );
}

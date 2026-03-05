import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TestSetup from '../components/TestSetup';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/tests');
        if (response.ok) {
          const data = await response.json();
          setTests(data);
        }
      } catch (err) {
        console.error('Failed to fetch tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleTestCreated = (test) => {
    setTests((prev) => [test, ...prev]);
    router.push(`/test/${test.id}`);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>ProArms Tech Live Fire Tracking System</h1>
        <p>Fast, accurate data entry at the range with offline resilience</p>
      </header>

      <div className={styles.content}>
        <TestSetup onTestCreated={handleTestCreated} />

        {!loading && tests.length > 0 && (
          <div className={styles.recentTests}>
            <h3>Recent Tests</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Gun Model</th>
                  <th>Caliber</th>
                  <th>Planned Rounds</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.gun_model}</td>
                    <td>{test.caliber}</td>
                    <td>{test.planned_rounds}</td>
                    <td>{test.status}</td>
                    <td>
                      <button
                        onClick={() => router.push(`/test/${test.id}`)}
                        className={styles.btnSmall}
                      >
                        Resume
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

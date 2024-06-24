import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

const Home = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        setUser(data.user);
      } else {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Home Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <Link href="/api/auth/signout">Sign Out</Link>
        </div>
      ) : (
        <div>
          <p>Please sign in.</p>
          <Link href="/api/auth/signin">Sign In</Link>
        </div>
      )}
    </div>
  );
};

export default Home;

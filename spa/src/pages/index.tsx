import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/Home.module.css';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/protected');
      } else {
        router.push('/login');
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return null;
};

export default Home;

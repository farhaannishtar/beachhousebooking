import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import styles from '@/styles/Home.module.css';
import { supabase } from '@/utils/supabase/client';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/protected/logs');
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
Home.useNoLayout = true;

export default Home;

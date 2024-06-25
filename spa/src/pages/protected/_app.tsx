import BottomNav from '@/components/layout/BottomNav';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // return <Component {...pageProps} />;
  <main className="min-h-screen flex flex-col justify-between w-full">

    {/* Router view */}
    <section className="router-view flex-1 scroll-auto ">
      <Component {...pageProps} />
    </section>
    <BottomNav />
  </main>
}

export default MyApp;

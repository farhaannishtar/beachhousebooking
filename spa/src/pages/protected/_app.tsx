import BottomNav from '@/components/layout/BottomNav';
import type { AppProps } from 'next/app';
import ProtectedLayout from 'src/layouts/ProtectedLayout';

function MyApp({ Component, pageProps }: AppProps) {
    <ProtectedLayout>
        <Component {...pageProps} />
    </ProtectedLayout>


}

export default MyApp;

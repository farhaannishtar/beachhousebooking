
import '@/styles/globals.css';
import '@/styles/globalIcon.css';
import { Plus_Jakarta_Sans } from 'next/font/google'


const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Next.js and Supabase Starter Kit",
    description: "The fastest way to build apps with Next.js and Supabase",
};

const plusJakartaSans = Plus_Jakarta_Sans({
    weight: ["400", "700"],
    subsets: ['latin'],
    display: 'swap',
})

import type { AppProps } from 'next/app';
import ProtectedLayout from 'src/layouts/ProtectedLayout';
import React, { ReactNode } from 'react';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    return (
        <>

            {children}

        </>
    );
};
function MyApp({ Component, pageProps }: AppProps) {
    const useNoLayout = (Component as { noLayout?: boolean }).noLayout || false;
    const Layout = !useNoLayout ? ProtectedLayout : DefaultLayout;
    return <main className={`${plusJakartaSans.className} min-h-screen flex flex-col items-center w-full container`}> <Layout><Component {...pageProps} /></Layout> </main>
}

export default MyApp;


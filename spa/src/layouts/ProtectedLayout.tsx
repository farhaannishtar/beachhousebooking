"use client";
import BottomNav from "@/components/layout/BottomNav";


export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-screen flex flex-col justify-between w-full">

            {/* Router view */}
            <section className="router-view flex-1 scroll-auto ">{children}</section>
            {/* Bottom Nav bar */}
            <BottomNav />
        </main>
    );
}
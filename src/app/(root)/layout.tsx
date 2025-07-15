'use client';

import Navbar from "../components/Navbar"
import Loading from '../components/Loading';
import { useAuth } from "../components/context/AuthContext"

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {

    const { isAuthLoading } = useAuth();

 if (isAuthLoading) {
  return (
   <Loading/>
  );
}
    return (
        <main>
            <Navbar/>
            {children}
        </main>
    )
}
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vp-bg">
        <Loader2 className="w-12 h-12 text-vp-accent4 animate-spin stroke-[3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vp-bg p-4">
        <div className="vibrant-card !border-vp-accent3 bg-white p-12 max-w-md text-center space-y-6">
          <h1 className="text-3xl font-black italic text-vp-accent3 tracking-tighter shadow-sm">ERROR</h1>
          <p className="font-bold text-lg opacity-80 leading-relaxed italic">{error.message}</p>
          <button onClick={() => window.location.reload()} className="vibrant-btn vibrant-btn-primary w-full">RELOAD</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-vp-bg p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="vibrant-card border-vp-ink bg-white p-12 max-w-lg w-full text-center space-y-10"
        >
          <div className="space-y-6">
            <h1 className="text-[24pt] font-helvetica sm:font-pixel font-black italic tracking-normal text-vp-ink leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis">
              Knowledge Journal 💗
            </h1>
            <p className="font-semibold text-[20pt] font-helvetica sm:font-sans text-vp-ink opacity-70 leading-tight">
              An infinite chamber of curiosities that transcends conventional norms of learning.
            </p>
          </div>
          
          <div className="py-2">
            <div className="w-24 h-24 mx-auto bg-vp-secondary border-3 border-vp-ink rounded-full flex items-center justify-center animate-bounce shadow-[4px_4px_0px_#000]">
                <span className="text-4xl">✨</span>
            </div>
          </div>

          <button 
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="vibrant-btn vibrant-btn-primary w-full py-5 text-lg"
          >
            <LogIn size={22} />
            SIGN IN WITH GOOGLE
          </button>
          
          <p className="font-medium text-sm opacity-60 uppercase tracking-widest">
            The collective memory chamber awaits.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

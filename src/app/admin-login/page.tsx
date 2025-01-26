'use client'
import React from 'react';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/template-editor-example'); 
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center py-8">
    <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-8 font-dm-serif-display">Login</h2>
    <form className="space-y-4 p-6 md:p-8 max-w-sm w-full" onSubmit={handleLogin}>
      <input className="w-full border shadow-sm  font-medium text-neutral-950 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md px-4 py-3 text-sm" type="email" name="email" placeholder="Email" required />
      <input className="w-full border shadow-sm  font-medium text-neutral-950 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md px-4 py-3 text-sm" type="password" name="password" placeholder="Password" required />
      <button className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white" type="submit">Login</button>
    </form>
    </div>
  );
};

export default LoginPage;

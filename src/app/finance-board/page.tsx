"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinanceBoardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/finance');
  }, [router]);

  return <div className="min-h-screen bg-[#f8f9ff]"></div>;
}

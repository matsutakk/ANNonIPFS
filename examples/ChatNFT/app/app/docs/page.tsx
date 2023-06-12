"use client"; 

import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });


export default function Docs() {
    const [data, setData] = useState("");

  return (
    <main className={inter.className}>
      <p>{data}</p>
    </main>
  );
}

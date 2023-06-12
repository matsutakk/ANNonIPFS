"use client"; 

import { useEffect, useState } from 'react';


export default function Docs() {
    const [data, setData] = useState("");

  return (
    <main>
      <p>{data}</p>
    </main>
  );
}

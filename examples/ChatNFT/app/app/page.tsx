import { Inter } from 'next/font/google';
import Form from '@/components/Form';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={inter.className}>
      <Image
        src="http://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi"
        alt="Picture from IPFS"
        width={500}  // or the width you want
        height={300} // or the height you want
      />
      <Form />
    </main>
  );
}

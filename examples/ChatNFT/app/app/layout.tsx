import Header from '@/components/Header'
import './globals.css'

export const metadata = {
  title: 'Chat NFT',
  description: 'A nft recommendation chatbot powered by GPT-3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="dark">
      <head />
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

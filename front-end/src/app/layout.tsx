import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import Web3Wrapper from '@/components/Web3Wrapper'
import Layout from './layout_client'
import Navbar from '@/components/NavbarComponent'

const font = Raleway({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Uang Kasep',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Web3Wrapper>
          <Navbar></Navbar>

          <Layout>
            {children}
          </Layout>
        </Web3Wrapper>
      </body>
    </html>
  )
}

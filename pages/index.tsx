import React from 'react'
import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import picture from '../assets/dogstar-black.png'
import logo from '../assets/logo-dogstar-black.png'
import Image  from 'next/image'
import {  Header } from '../components'
import { useAccount, useIsMounted } from '../wallet'
import { ConnectButton } from '../components/partials'
import { Footer } from '../components'
import { useRouter } from 'next/router';


const Home: NextPage = () => {
  
  const mounted = useIsMounted()
  const { data: account } = useAccount()
  const router = useRouter()

  if (mounted && account) {
    router.push("/banners")
  }

  return (    
      <>
        <Header/>
        <main className={styles.main}>
          <div>
          <Image src={logo}  height={50}  width={145} alt="logo image" />
          </div>
          <div className={styles.imgContainer}>
          <Image src={picture} height={375}  width={250}    alt="DL image" />
          </div>
          <h1><span>Connect</span> your brand to 500k<span> Defi users</span></h1>
          <h3>Bid now to sponsor  a 5 day event league</h3>
          <ConnectButton label="Connect Wallet" />
        </main>
        <Footer />
      </>
  )
}

export default Home

import React from 'react'
import type { NextPage } from 'next'
import styles from './Banners.module.css'
import { Banner, Countdown, Header } from '../../components'
import { Footer , Head} from '../../components'
import {getBanners} from '../../services/banners'

const Banners: NextPage = () => {

  const Banners = getBanners() 

  return (
    <>
      <Header />
      <main className={styles.main}>
      <Head  backButton={false} />
        <h1 className={styles.title}>Live <br/> Auction</h1>
        <Countdown />

        {
            Banners && Banners.map( (banner, idx) => (
                <div key={idx}  className={styles.content}>
                  <Banner    {...banner} />
                </div>
              )
            )
        }
      </main>   
      <Footer />
    </>
  )
}

export default Banners

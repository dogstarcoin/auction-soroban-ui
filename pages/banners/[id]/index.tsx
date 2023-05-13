import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import styles from '../Banners.module.css'
import { BannerBid, Countdown, Footer , Head} from '../../../components'
import {getBanners} from '../../../services/banners'
import {Banner} from '../../../models/Banner'
import { useRouter } from 'next/router'
import { Header } from '../../../components'
import { Loading } from '../../../components/partials'

const SingleBanner: NextPage = () => {


  const router = useRouter()

  const {id} = router.query
  const [bannerlocal,setBannerlocal] =  useState<Banner>()
  
  useEffect(() => {
    if(!id) {
      return;
    }
    setBannerlocal(getBanners().find((e) => e.id == Number(id)) )

  }, [id])
  
  
  return (
    <>
      {!bannerlocal ? (
        <Loading size={64} />
      ) : (
      
      <>  
        <Header />
        <main className={styles.main}>
          <Head  backButton={true} />
          <h1 className={styles.title} >Become <br/> {bannerlocal.name}</h1>
          <Countdown />
          <div >
              <BannerBid  {...bannerlocal}/>
          </div>
          <div>
          </div>
        </main>
        <Footer/>
      </>
      )
      }
  </>
  )
}

export default SingleBanner

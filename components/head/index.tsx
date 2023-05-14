import { WalletData } from '../wallet-data'
import logo from '../../assets/logo-dogstar-white.png'
import historyBack from '../../assets/history-back.png'

import Image  from 'next/image'
import  { useRouter } from 'next/router'
import styles from './style.module.css'

export function Head (props :  { backButton : boolean}  ) {

  const router  = useRouter()

  const goToBack = () => {
    router.back()
  }

  return (
    <header>
        
        <Image src={logo}  height={50}  width={145} alt="logo image" />
        <div className={styles.wrapper}>
            {
              props.backButton && (
                  <Image className={styles.backButton} src={historyBack}  height={40}  width={40} alt="History backimage"  onClick={ () => goToBack()} />
              )
            }
           <WalletData />
        </div>
    </header>

  )
}


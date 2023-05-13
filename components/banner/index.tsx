import React from 'react'
import {  Loading } from '../partials'
import styles from './style.module.css'
import { Utils } from '../../shared/utils'
import { useContractValue } from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client'
import * as convert from '../../convert'
import { Constants } from '../../shared/constants'
import { useSorobanReact } from '@soroban-react/core'
import {Banner} from '../../models/Banner'
import { useRouter } from 'next/router'
let xdr = SorobanClient.xdr

export  function Banner  (  bannerlocal: Banner ) {

  const sorobanContext = useSorobanReact()
  const router = useRouter();

  const useLoadToken = (): any => {
    return {
      balance: useContractValue({ 
        contractId: Constants.TokenId,
        method: 'balance',
        params: [SorobanClient.Address.contract(Buffer.from(Constants.RoundId, 'hex')).toScVal()],
        sorobanContext
      }),

      decimals: useContractValue({ 
        contractId: Constants.TokenId,
        method: 'decimals',
        sorobanContext
      }),

      name: useContractValue({ 
        contractId: Constants.TokenId,
        method: 'name',
        sorobanContext
      }),

      symbol: useContractValue({ 
        contractId: Constants.TokenId,
        method: 'symbol',
        sorobanContext
      }),
    }
  }

  let token = useLoadToken()
  

  const tokenSymbol =
    token.symbol.result && convert.scvalToString(token.symbol.result)?.replace("\u0000", "")

  let banner = useContractValue({ 
    contractId: Constants.RoundId,
    method: 'get_banner',
    params :  [xdr.ScVal.scvU32(Number(bannerlocal.id)) ], 
    sorobanContext
  })

  const bestBid = convert.scvalToBigNumber(banner.result?.map()?.[0].val() )
  const closePrice =  convert.scvalToBigNumber(banner.result?.map()?.[2].val())  
 
  const isLoading = (): boolean | undefined => {
    return (
      token.decimals.loading ||
      token.symbol.loading ||      
      banner.loading
    )
  }

  const goToBid = (id :number |  undefined ) => {
    if ( bannerlocal.id)
      router.push("/banners/" + bannerlocal.id)
  }

  return (
    <>
      {isLoading() ? (
        <Loading size={64} />
      ) : (
        <>
          <div className={styles.wrapper}>
            <hr />
            <div className={styles.box}>
                <div className={styles.content}>
                <h3>{bannerlocal.name} <span>Banner   </span></h3>
                <div> 
                <h4 className={styles.bestBid}>Best bid | {Utils.formatAmount(bestBid, 0)} {tokenSymbol}</h4>
                
                </div>
                <div>
                <h4 className={styles.closePrice}>Close price | {Utils.formatAmount(closePrice, 0)} {tokenSymbol}</h4>  
                </div>
                </div>
                <div className={styles.bid} >
                  {
                    (Utils.amountToNumber(bestBid, 0) < Utils.amountToNumber(closePrice, 0)) && (
                    <button className={styles.bidButton} onClick={() => goToBid(bannerlocal.id)}>
                        Bid <br/><span>Now</span><br/>_
                    </button>
                    )
                  }
                </div>
            </div>  
            <div>
              <span className={styles.values}>
                {bannerlocal.size} Banner
              </span>  
            </div>   
            <div>
              <span className={styles.values}>
                {bannerlocal.feature}
              </span>
            </div>
            <div>
              <span className={styles.values}>
                {bannerlocal.feature2}
              </span>
            </div>          
          </div>
        </>
      )}
      </>

  )
}

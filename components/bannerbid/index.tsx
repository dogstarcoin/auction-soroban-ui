import React from 'react'
import {  ConnectButton, Loading } from '../partials'
import styles from './style.module.css'
import { Utils } from '../../shared/utils'
import {
  useAccount,
  useNetwork,
} from '../../wallet'
import { useContractValue } from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client'
import * as convert from '../../convert'
import { Constants } from '../../shared/constants'
import { useSorobanReact } from '@soroban-react/core'
import {Banner} from '../../models/Banner'
import { Bid } from '../bid'
let xdr = SorobanClient.xdr

export  function BannerBid   (  bannerlocal: Banner ) {

  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const networkPassphrase = activeChain?.networkPassphrase ?? ''
  const sorobanContext = useSorobanReact()

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
  
  const tokenDecimals =
    token.decimals.result && (token.decimals.result?.u32() ?? 7)
  const tokenSymbol =
    token.symbol.result && convert.scvalToString(token.symbol.result)?.replace("\u0000", "")

  let bannerSc = useContractValue({ 
    contractId: Constants.RoundId,
    method: 'get_banner',
    params :  [xdr.ScVal.scvU32(Number(bannerlocal.id)) ], 
    sorobanContext
  })

  const bestBid = convert.scvalToBigNumber(bannerSc.result?.map()?.[0].val())
  const minimumBid = convert.scvalToBigNumber(bannerSc.result?.map()?.[3].val())
  const closePrice =  convert.scvalToBigNumber(bannerSc.result?.map()?.[2].val()) 

  /*
  const totalBids = bannerSc.result?.map()?.[1].val().map()?.length ||  0 
  const bids :BigNumber[] =[]

  for (let i = 0  ; i < totalBids ; i++) {
     bids.push(convert.scvalToBigNumber(bannerSc.result?.map()?.[1].val().map()?.[i].val()))
  }*/

  const isLoading = (): boolean | undefined => {
    return (
      token.decimals.loading ||
      token.symbol.loading ||
      bannerSc.loading
    )
  }

  return (
    <>
      {isLoading() ? (
        <Loading size={64} />
      ) : (
        <>
          <div className={styles.wrapper}>
            <hr />
            <h2>Current winner <span>bid</span></h2>
            <hr />
            <span className={styles.bestBid}>{Utils.formatAmount(bestBid,0)} {tokenSymbol}</span>
            <hr />
            <h2>Get <span>the bone</span></h2>
            <p className={styles.minBid}>Min Bid: {Utils.amountToNumber(minimumBid,0)}</p>
            {
            (account && bannerlocal.id  ? (
              <Bid 
                tokenId={Constants.TokenId}
                RoundId={Constants.RoundId}
                decimals={tokenDecimals}
                networkPassphrase={networkPassphrase}
                account={account.address}
                symbol={tokenSymbol}
                bannerId={bannerlocal.id}
                closePrice={Utils.amountToNumber(closePrice,0)}
                bestBid={Utils.amountToNumber(bestBid,0)}
                />
            ) : (
              <ConnectButton label="Connect wallet to bid" isHigher={true} />
            ))}                  
          </div>
        </>
      )}
      </>

  )
}

import React, { FunctionComponent, useEffect, useState } from 'react'
import {  Loading } from '../partials'
import styles from './style.module.css'
import { useContractValue } from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client'
import * as convert from '../../convert'
import { Constants } from '../../shared/constants'
import { useSorobanReact } from '@soroban-react/core'
let xdr = SorobanClient.xdr

const Countdown: FunctionComponent = () => {

  const sorobanContext = useSorobanReact()
  // Call the contract rpcs to fetch values
  const [countdown, setCountdown] = useState<String>("")

  let deadline = useContractValue({ 
    contractId: Constants.RoundId,
    method: 'deadline',
    sorobanContext
  })

    const deadlineDate =
    deadline.result &&
    new Date(
      convert.xdrUint64ToNumber(
        deadline.result.u64() ?? xdr.Int64.fromString('0')
      ) * 1000
  ).getTime() || Number(0)


  useEffect(() => {

    // Find the distance between now and the count down date
    const countdownInternal = setInterval(function() {
      let now = new Date().getTime()
      let distance = deadlineDate  - now

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(distance / (1000 * 60 * 60 * 24))
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((distance % (1000 * 60)) / 1000)
    
      if(deadlineDate != 0 ){
        if(deadlineDate >  now)
          setCountdown(days + "d : " + hours + "h : " + minutes + "m  : " + seconds + "s ")
        else
          setCountdown("Auction Expired")
      }

    }, 1000);

    return () => {
      clearInterval(countdownInternal);
    };
  }, [deadline.loading]);

  const isLoading = (): boolean | undefined => {
    return ( 
      deadline.loading
    )
  }


  return (
    <>
      {isLoading() ? (
        <Loading size={64} />
      ) : (
        <>   
          <div >
            <h3 className={styles.label}>AUCTION COUNTDOWN</h3> 
            <span className={styles.values}>
              {countdown}
            </span>  
          </div>        
        </>
      )}
    </>
  )
}

export { Countdown }

import React from 'react'
import styles from './style.module.css'

import { IResultSubmit } from '../bid'

export interface TransactionModalProps {
  result: IResultSubmit
  closeModal: () => void
}

export function TransactionModal({
  result,
  closeModal,
}: TransactionModalProps) {
  const isSuccess = result.status == 'success'

  return (
    <div>
      <div className={styles.darkBG} onClick={closeModal} />
      <div className={styles.centered}>
        <div className={styles.modal}>   
          <span className={styles.value}>
            {isSuccess ? `${result.value} ${result.symbol}` : ''}
          </span>
          <h6>{isSuccess ? 'SUCCESSFULLY BIDDED' : 'ERROR'}</h6>
          <span className={styles.message}>
            {isSuccess
              ? 'Stay tune for new bids. Auction is still running!'
              : result.error}
          </span>  
          <button className={styles.button} onClick={closeModal}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

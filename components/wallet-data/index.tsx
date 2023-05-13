import React from 'react'
import { useAccount, useIsMounted, useNetwork } from '../../wallet'
import { ConnectButton } from '../partials'
import styles from './style.module.css'

// TODO: Eliminate flash of unconnected content on loading
export function WalletData() {
  const mounted = useIsMounted()

  const { data: account } = useAccount()

  const { activeChain: chain, chains } = useNetwork()

  const unsupportedChain = chain?.unsupported

  return (
    <>
      {mounted && account ? (
        <div className={styles.displayData}>
          <div className={styles.card}>{account.displayName}</div>
        </div>
      ) : (
        <ConnectButton label="Connect Wallet" />
      )}
    </>
  )
}

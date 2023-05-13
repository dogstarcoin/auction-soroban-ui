import React, { FunctionComponent, useState } from 'react'
import { AmountInput } from '../partials'
import { TransactionModal } from '../transaction-modal'
import { useSendTransaction } from '@soroban-react/contracts'
import {  useSorobanReact } from '@soroban-react/core'
import { useNetwork } from '../../wallet'
import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import * as convert from '../../convert'
import { Loading } from '../partials/loading'
import styles from './style.module.css'
let xdr = SorobanClient.xdr

export interface IFormBidProps {
  account: string
  tokenId: string
  RoundId: string
  decimals: number
  networkPassphrase: string
  symbol?: string
  bannerId : number
  closePrice : number
  bestBid : number
}

export interface IResultSubmit {
  status: string
  scVal?: SorobanClient.xdr.ScVal
  error?: string
  value?: number
  symbol?: string 

}


const Bid: FunctionComponent<IFormBidProps> = props => {

  const sorobanContext = useSorobanReact()
  
  const [amount, setAmount] = useState<number>()
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [input, setInput] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const { server } = useNetwork()
  const parsedAmount = BigNumber(amount || 0)
  const { sendTransaction } = useSendTransaction()

  const closeModal = (): void => {
    // TODO: Make this reload only the component
    if (resultSubmit?.status == 'success') {
      window.location.reload()
    }
    setResultSubmit(undefined)
  }


  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true)

    if (!server) throw new Error("Not connected to server")

    const source = await server.getAccount(props.account)
    const amountScVal = convert.bigNumberToI128(parsedAmount)

    try {
      //  bid for the banner
      let result = await sendTransaction( 
        contractTransaction(
          props.networkPassphrase,
          source,
          props.RoundId,
          'bid',
          xdr.ScVal.scvU32(props.bannerId ), 
          amountScVal,
          new SorobanClient.Address(props.account).toScVal()          
        ),     
        {
          timeout: 60 * 1000, // should be enough time to approve the tx
          sorobanContext
        }
     
      )
      setResultSubmit({
        status: 'success',
        scVal: result,
        value: amount,
        symbol: props.symbol
       
      })
      setInput('')
      setAmount(undefined)
    } catch (e) {
      if (e instanceof Error) {
        setResultSubmit({
          status: 'error',
          error: e?.message || 'An error has occurred',
        })
      } else {
        throw e;
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Small helper to build a contract invokation transaction
  function contractTransaction(
    networkPassphrase: string,
    source: SorobanClient.Account,
    contractId: string,
    method: string,
    ...params: SorobanClient.xdr.ScVal[]
  ): SorobanClient.Transaction {
    const contract = new SorobanClient.Contract(contractId)
    return new SorobanClient.TransactionBuilder(source, {
        // TODO: Figure out the fee
        fee: '100',
        networkPassphrase,
      })
      .addOperation(contract.call(method, ...params))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build()
  }

  return (
    <div>    
      <AmountInput
        placeHolder="Enter amount"
        setAmount={setAmount}
        input={input}
        setInput={setInput}
      />
      {
        (props.bestBid < props.closePrice)  && (
            <>
              <button className={styles.button} onClick={handleSubmit} disabled={!amount || isSubmitting}>
                {isSubmitting ? <Loading size={18} /> : 'Place Bid'}
              </button>
              <button className={styles.buttonRed} onClick={handleSubmit} disabled={!props.closePrice || isSubmitting}>
                {isSubmitting ? <Loading size={18} /> : 'Close Price'}
              </button>
            </>
          )
      }
      {resultSubmit && (
        <TransactionModal result={resultSubmit} closeModal={closeModal} />
      )}
    </div>
  ) 
}

export { Bid }

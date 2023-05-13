import BigNumber from "bignumber.js"

export interface Banner {
    id?: number
    name?: string
    feature?: string
    feature2?: string
    size?: string
    bids? : BigNumber[]
    closePrice? : number
    bestBid? : number 
    minimumBid? : number
   
  }

  
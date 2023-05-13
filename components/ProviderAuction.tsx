import React from 'react'
import {SorobanReactProvider} from '@soroban-react/core';
import {futurenet, sandbox, standalone} from '@soroban-react/chains';
import {freighter} from '@soroban-react/freighter';
import {ChainMetadata, Connector} from "@soroban-react/types";
      
const chains: ChainMetadata[] = [futurenet, sandbox, standalone];
const connectors: Connector[] = [freighter()]
                          
                          
  export default function ProviderAuction({children}:{children: React.ReactNode}) {
    return (
      <SorobanReactProvider
        chains={chains}
        appName={"Auction Dogstar League"}
        connectors={connectors}      
        >
          {children}
      </SorobanReactProvider>
    )
  }
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import ProviderAuction from '../components/ProviderAuction';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ProviderAuction>
      <Component {...pageProps} />
    </ProviderAuction>
  );
}

export default MyApp
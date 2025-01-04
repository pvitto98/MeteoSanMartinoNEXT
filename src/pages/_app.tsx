import { AppProps } from 'next/app';
import NavigationBar from '@/components/NavigationBar'; // Make sure the path is correct
import '../../global.css'; // Your global CSS file

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavigationBar /> {/* Include the NavigationBar at the top of every page */}
      <Component {...pageProps} /> {/* This renders the page component */}
    </>
  );
}

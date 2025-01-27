import { AppProps } from 'next/app';
import NavigationBar from '@/components/NavigationBar'; // Make sure the path is correct
import '../../global.css'; // Your global CSS file
import { WeatherNav } from '@/newComponents/Navbar';
import styles from './app.module.css';

import { Rubik } from 'next/font/google';

// Configure Rubik font
const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${styles.weatherPage} ${rubik.className}`}>
      {/* <NavigationBar /> Include the NavigationBar at the top of every page */}
      <WeatherNav
      locationName="San Martino delle Scale"
      category="Meteo"
      imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/613fc0f38cc1a9c6d440dc25d81e8baf0e4433215d6c5283a7e7f2b29814e45a?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
    />
      <Component {...pageProps} /> {/* This renders the page component */}
    </div>
  );
}

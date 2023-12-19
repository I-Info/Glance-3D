import '@/styles/globals.css';
import { ThemeProvider, createTheme } from '@mui/material';
import { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { glMatrix } from 'gl-matrix';
import Head from 'next/head';

// Set glMatrix to use the js vanilla array instead of Float32Array globally for a better performance.
glMatrix.setMatrixArrayType(Array);

const inter = Inter({
  subsets: ['latin'],
  fallback: ['Roboto', 'Helvetica', 'sans-serif'],
});

const theme = createTheme({
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>

      <style global jsx>{`
        html {
          font-family: ${inter.style.fontFamily};
          font-style: ${inter.style.fontStyle};
        }
      `}</style>
    </>
  );
}

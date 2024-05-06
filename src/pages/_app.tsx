import '@/styles/globals.css';
import React from 'react';
import {
  CssBaseline,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider} from '@mui/material/styles';
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

export default function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
        typography: {
          fontFamily: inter.style.fontFamily,
        },
      }),
    [prefersDarkMode]
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
        <CssBaseline />
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

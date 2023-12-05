import React from 'react';
import Head from 'next/head';
import Content from '@/components/Content';

export default function Home() {
  return (
    <>
      <Head>
        <title>Glance 3D</title>
        <meta
          name="description"
          content="A simple interactive 3D model viewer."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <h1>Glance 3D</h1>
      <Content />
    </>
  );
}

import Head from 'next/head';
import Scene from '@/components/Scene';
import { AppBar, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { Menu } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import { css } from '@emotion/react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Glance 3D</title>
        <meta
          name="description"
          content="A simple interactive 3D model viewer."
        />
      </Head>

      <Stack
        css={css`
          height: 100%;
        `}
      >
        <AppBar position="static" component="nav">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6">Glance 3D</Typography>
          </Toolbar>
        </AppBar>
        <Grid
          container
          css={css`
            flex: 1;
          `}
        >
          <Grid xs={1}></Grid>
          <Grid xs>
            <Scene />
          </Grid>
          <Grid xs={1}></Grid>
        </Grid>
      </Stack>
    </>
  );
}

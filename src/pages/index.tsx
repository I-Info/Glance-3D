import Head from 'next/head';
import Scene from '@/components/Scene';
import {
  IconButton,
  Stack,
  Toolbar,
  Typography,
  AppBar,
  Box,
  Divider,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FileOpen as FileOpenIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import { css } from '@emotion/react';
import { STLLoader } from '@/engine/loaders/STLLoader';
import useRemoteModel from '@/hooks/useModel';
import { OBJLoader } from '@/engine/loaders/OBJLoader';
import { Object3D } from '@/engine/Object';
import { Mesh } from '@/engine/objects/Mesh';

function Content() {
  const parser = new STLLoader();
  const { model, error, isLoading } = useRemoteModel(
    '/models/teapot/teapot.stl'
  );

  // const parser = new OBJLoader();
  // const { model, error, isLoading } = useRemoteModel(
  //     '/models/teapot/teapot.obj'
  // );

  if (isLoading || !model) {
    return <div>loading...</div>;
  } else if (error) {
    return <div>error: {error.message}</div>;
  }

  const geo = parser.parse(model);
  const obj = new Mesh(geo);

  // const modelStr = new TextDecoder().decode(model);
  // const obj = parser.parse(modelStr);
  return <Scene obj={obj} />;
}

const Panel = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

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
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Glance 3D</Typography>
          </Toolbar>
        </AppBar>
        <Panel>
          <Stack direction="row">
            <IconButton>
              <FileOpenIcon />
            </IconButton>
            <IconButton>
              <LinkIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem />
          </Stack>
        </Panel>
        <Grid
          container
          css={css`
            flex-grow: 1;
          `}
        >
          <Grid xs={1}></Grid>
          <Divider orientation="vertical" flexItem />
          <Grid xs>
            <Content />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

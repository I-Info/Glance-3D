import React from 'react';
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
  Menu,
  MenuItem,
  MenuList,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FileOpen as FileOpenIcon,
  Link as LinkIcon,
  Close,
} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import { css } from '@emotion/react';
import { STLLoader } from '@/engine/loaders/STLLoader';
import useRemoteModel from '@/hooks/useModel';
import { OBJLoader } from '@/engine/loaders/OBJLoader';
import { Object3D } from '@/engine/Object';
import { Mesh } from '@/engine/objects/Mesh';

const parser = new STLLoader();

const Content = React.memo(function () {
  const { model, error, isLoading } = useRemoteModel(
    '/models/teapot/teapot.stl'
  );
  // console.log(model, error, isLoading);

  // const parser = new OBJLoader();
  // const { model, error, isLoading } = useRemoteModel(
  //     '/models/teapot/teapot.obj'
  // );

  const obj = React.useMemo(() => {
    if (!model) return;

    const geo = parser.parse(model);
    return new Mesh(geo);
  }, [model]);

  if (isLoading || !obj) {
    return <div>loading...</div>;
  } else if (error) {
    return <div>error: {error.message}</div>;
  }

  // const geo = parser.parse(model);
  // const obj = new Mesh(geo);

  // const modelStr = new TextDecoder().decode(model);
  // const obj = parser.parse(modelStr);
  return <Scene obj={obj} />;
});
Content.displayName = 'Content';

const Panel = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

function MenuButton({ onOpen }: { onOpen: () => void }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleMenuClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        onClick={handleMenuClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              onOpen();
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <FileOpenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}

function FunctionalBar() {
  return (
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
  );
}

function OpenModelDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Modal title</DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          // color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent dividers>
        <Typography gutterBottom>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </Typography>
        <Typography gutterBottom>
          f Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
          Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
        </Typography>
        <Typography gutterBottom>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
          magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
          ullamcorper nulla non metus auctor fringilla.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Home() {
  const [open, setOpen] = React.useState(false);
  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Head>
        <title>Glance 3D</title>
        <meta
          name="description"
          content="A simple interactive 3D model viewer."
        />
      </Head>

      <OpenModelDialog open={open} onClose={handleClose} />

      <Stack
        css={css`
          height: 100%;
        `}
      >
        <AppBar position="static">
          <Toolbar>
            <MenuButton onOpen={handleOpen} />
            <Typography variant="h6">Glance 3D</Typography>
          </Toolbar>
        </AppBar>

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

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
  Input,
  FormControl,
  InputAdornment,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FileOpen as FileOpenIcon,
  Link as LinkIcon,
  Close,
  UploadFile,
  FileUpload,
  Delete,
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

function FileInput({ onChange }: { onChange: (file: File | null) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileName = React.useRef<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    fileName.current = file.name;
    onChange(file);
  };

  const handleDelete = () => {
    onChange(null);
    fileName.current = null;
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          width: '100%',
          minHeight: 40,
        }}
      >
        <Input
          sx={{ flexGrow: 1 }}
          readOnly
          value={fileName.current || ''}
          placeholder="No file selected"
          onClick={handleClick}
          startAdornment={
            <>
              <InputAdornment position="start">
                <UploadFile />
              </InputAdornment>
              <VisuallyHiddenInput
                ref={inputRef}
                type="file"
                onChange={handleChange}
              />
            </>
          }
        />
        {fileName.current ? (
          <IconButton onClick={handleDelete}>
            <Delete />
          </IconButton>
        ) : null}
      </Box>
    </>
  );
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function OpenModelDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);

  return (
    <Dialog open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }}>Open Model</DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent dividers sx={{ minWidth: 500 }}>
        <Stack>
          <FormControl>
            <FormLabel>Format</FormLabel>
            <RadioGroup row>
              <FormControlLabel value="obj" control={<Radio />} label="OBJ" />
              <FormControlLabel value="stl" control={<Radio />} label="STL" />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Model File</FormLabel>
            <FileInput onChange={setFile} />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} variant="contained">
          Open
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

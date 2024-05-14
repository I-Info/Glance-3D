import React from 'react';
import Head from 'next/head';
import { Scene, Shader } from '@/components/Scene';
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
  Delete,
  LightMode,
} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import { css } from '@emotion/react';
import { STLLoader } from '@/engine/loaders/STLLoader';
import { OBJLoader } from '@/engine/loaders/OBJLoader';
import { Object3D } from '@/engine/Object';
import { Mesh } from '@/engine/objects/Mesh';

const Content = React.memo(function ({
  obj,
  shader,
}: {
  obj: Object3D;
  shader: Shader;
}) {
  return <Scene obj={obj} shader={shader} />;
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

function LightModeButton({
  setLightMode,
}: {
  setLightMode: (mode: Shader) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleButtonClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleMenuClick(name: Shader) {
    setLightMode(name);
    handleMenuClose();
  }

  return (
    <>
      <IconButton onClick={handleButtonClick}>
        <LightMode />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              handleMenuClick('blinn-phong');
            }}
          >
            <ListItemText>Blinn-Phong</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClick('phong');
            }}
          >
            <ListItemText>Phong</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClick('gouraud');
            }}
          >
            <ListItemText>Gouraud</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClick('simple');
            }}
          >
            <ListItemText>Simple</ListItemText>
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

function FileInput({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    onChange(file);
  };

  const handleDelete = () => {
    onChange(null);
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
          value={file?.name || ''}
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
        {file ? (
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
  onLoaded,
}: {
  open: boolean;
  onClose: () => void;
  onLoaded: (obj: Object3D) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [format, setFormat] = React.useState<'obj' | 'stl'>('obj');

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as 'obj' | 'stl');
  };

  const handleSubmit = () => {
    if (!file) return;
    if (format === 'obj') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = new OBJLoader().parse(reader.result as string);
          onLoaded(obj);
          onClose();
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsText(file);
    } else if (format === 'stl') {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const geo = new STLLoader().parse(reader.result as ArrayBuffer);
          const obj = new Mesh(geo);
          onLoaded(obj);
          onClose();
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

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
            <RadioGroup row value={format} onChange={handleFormatChange}>
              <FormControlLabel value="obj" control={<Radio />} label="OBJ" />
              <FormControlLabel value="stl" control={<Radio />} label="STL" />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Model File</FormLabel>
            <FileInput file={file} onChange={setFile} />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleSubmit} variant="contained">
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [obj, setObj] = React.useState<Object3D | null>(null);
  const [lightMode, setLightMode] = React.useState<Shader>('blinn-phong');

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  function handleOpenModel(obj: Object3D) {
    setObj(obj);
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

      <OpenModelDialog
        open={open}
        onClose={handleClose}
        onLoaded={handleOpenModel}
      />

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
          <Stack direction="column">
            <IconButton onClick={handleOpen}>
              <FileOpenIcon />
            </IconButton>
            <LightModeButton setLightMode={setLightMode} />
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Grid xs>
            {obj ? <Content obj={obj} shader={lightMode} /> : null}
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

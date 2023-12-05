import Canvas from '@/components/Canvas';
import useShaderCode from '@/hooks/useShaderCode';

export default function Content() {
  const {
    shader: vert,
    error: errorV,
    isLoading: isLoadingV,
  } = useShaderCode('test.vert');

  const {
    shader: frag,
    error: errorF,
    isLoading: isLoadingF,
  } = useShaderCode('test.frag');

  if (errorV || errorF) {
    return <div>Error: {errorV?.message || errorF?.message}</div>;
  }
  if (isLoadingV || isLoadingF) {
    return <div>Loading...</div>;
  }

  if (!vert || !frag) {
    return <div>Failed to load shader code.</div>;
  }

  return (
    <>
      <Canvas
        shaders={{ vert: vert, frag: frag }}
        style={{ width: '80vw', height: '80vh', border: 'solid' }}
      />
    </>
  );
}

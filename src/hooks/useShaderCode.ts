import { Fetcher } from 'swr';
import useSWRImmutable from 'swr/immutable';

const shaderCodeFetcher: Fetcher<string, string> = (filename: string) =>
  fetch(`/shaders/${filename}`).then((res) => res.text());

export default function useShaderCode(filename: string) {
  const { data, error, isLoading } = useSWRImmutable<string, Error>(
    filename,
    shaderCodeFetcher
  );

  return {
    shader: data,
    error,
    isLoading,
  };
}

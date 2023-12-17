import { textFetcher } from '@/libs/browser';
import { Fetcher } from 'swr';
import useSWRImmutable from 'swr/immutable';

export const shaderCodeFetcher: Fetcher<string, string> = (filename: string) =>
  textFetcher('/shaders/' + filename);

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

import { shaderCodeFetcher } from '@/libs/common';
import useSWRImmutable from 'swr/immutable';

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

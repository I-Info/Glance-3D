import useSWRImmutable from 'swr/immutable';
import { blobFetcher } from '@/libs/browser';

const modelFetcher = (url: string) =>
  blobFetcher(url).then((blob) => blob.arrayBuffer());

export default function useRemoteModel(url: string) {
  const { data, error, isLoading } = useSWRImmutable<ArrayBuffer, Error>(
    url,
    modelFetcher
  );

  return {
    model: data,
    error,
    isLoading,
  };
}

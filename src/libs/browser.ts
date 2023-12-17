import { Fetcher } from 'swr';

export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export const blobFetcher = (url: string) =>
  fetch(url).then((res) => res.blob());

export const textFetcher = (url: string) =>
  fetch(url).then((res) => res.text());

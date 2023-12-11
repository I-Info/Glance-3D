import { Fetcher } from 'swr';

export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export const shaderCodeFetcher: Fetcher<string, string> = (filename: string) =>
  fetch(`/shaders/${filename}`).then((res) => res.text());

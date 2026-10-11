// react-query retry option for tRPC queries: retry server and network errors
// (up to 3 times, the default) but not client errors such as an unknown
// restaurant or a rejected search, which won't succeed on retry
export const retryServerErrors = (
  failureCount: number,
  error: { data?: { httpStatus?: number } | null },
) => (error.data?.httpStatus ?? 500) >= 500 && failureCount < 3;

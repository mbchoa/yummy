import type { ParsedUrlQuery } from "querystring";

export const getParamFromPath = (
  params: ParsedUrlQuery | undefined,
  param: string
): string | undefined => {
  const rawParam = params ? params[param] : undefined;

  if (Array.isArray(rawParam)) {
    return rawParam.join("/");
  }

  return rawParam;
};

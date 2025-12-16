import { dirname } from "path";
import { fileURLToPath } from "url";

export function getESMDirname(metaUrl: string) {
  return dirname(fileURLToPath(metaUrl));
}

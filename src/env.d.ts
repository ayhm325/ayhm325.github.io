/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

import type {} from "react";

declare module "react" {
  interface Attributes {
    "client:load"?: boolean;
    "client:idle"?: boolean;
    "client:visible"?: boolean | { rootMargin?: string };
    "client:media"?: string;
    "client:only"?: boolean | string;
  }
}

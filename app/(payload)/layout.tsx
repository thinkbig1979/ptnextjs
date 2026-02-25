/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from "next";
import type { ServerFunctionClient } from "payload";

import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";

import "@payloadcms/next/css";
import { importMap } from "./admin/importMap";

type Args = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Payload Admin",
  description: "Payload CMS Admin Panel",
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;

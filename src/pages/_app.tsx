import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistProvider, CssBaseline } from "@geist-ui/core";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GeistProvider>
      <CssBaseline />
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
      </ClerkProvider>
    </GeistProvider>
  );
};

export default api.withTRPC(MyApp);

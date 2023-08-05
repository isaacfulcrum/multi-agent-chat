// ** NextJS
import "@/styles/globals.css";
import type { AppProps } from "next/app";
// ** ChakraUI
import { ChakraProvider } from "@chakra-ui/react";
// ** Custom
import { MainWrapper } from "@/util/layout/component/MainWrapper";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-left', isClosable: true, duration: 4000/*ms*/ } }}>
      <MainWrapper>
        <Component {...pageProps} />
      </MainWrapper>
    </ChakraProvider>
  );
}

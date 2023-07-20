// ** NextJS
import "@/styles/globals.css";
import type { AppProps } from "next/app";
// ** ChakraUI
import { ChakraProvider } from "@chakra-ui/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-left', isClosable: true, duration: 4000/*ms*/ } }}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

// ** NextJS
import "@/styles/globals.css";
import type { AppProps } from "next/app";
// ** ChakraUI
import { ChakraProvider } from "@chakra-ui/react";
// ** React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ChakraProvider>
  );
}

import { PineconeClient } from "@pinecone-database/pinecone";

export const pinecone = new PineconeClient();
pinecone.init({
  apiKey: process.env.NODE_ENV ?? "",
  environment: process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT ?? "",
});

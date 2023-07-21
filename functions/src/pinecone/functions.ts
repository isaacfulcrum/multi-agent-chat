import { onCall } from "firebase-functions/v2/https";
import { PineconeClient } from "@pinecone-database/pinecone";

// ****************************************************************************
// == Pinecone ====================================================================
const getPinecone = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT || "",
    apiKey: process.env.PINECONE_API_KEY || "",
  });
  return pinecone;
};

// == Write =====================================================================
export const createIndex = onCall(async () => {
  try {
    const pinecone = await getPinecone();
    await pinecone.createIndex({
      createRequest: {
        name: "example-index",
        dimension: 1024,
      },
    });
  } catch (error) {
    console.log("PineconeService.createIndex error", error);
  }
});

export const upsert = onCall(async () => {
  try {
    const pinecone = await getPinecone();
    const index = pinecone.Index("example-index");
    const upsertRequest = {
      vectors: [
        {
          id: "vec1",
          values: [0.1, 0.2, 0.3, 0.4],
          metadata: {
            genre: "drama",
          },
        },
        {
          id: "vec2",
          values: [0.2, 0.3, 0.4, 0.5],
          metadata: {
            genre: "action",
          },
        },
      ],
      namespace: "example-namespace",
    };
    const upsertResponse = await index.upsert({ upsertRequest });
    return { result: upsertResponse };
  } catch (error) {
    console.log("PineconeService.createIndex error", error);
    return { result: "Error" };
  }
});

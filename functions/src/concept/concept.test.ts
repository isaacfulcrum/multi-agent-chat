import { getSummary } from "./concept";

describe("Concept summary", () => {
  test("Gets a new concept out of a list of concepts", async () => {
    try {
      const summary = await getSummary([
        {
          description:
            "A website is a collection of web pages and related content that is identified by a common domain name and published on at least one web server.",
          name: "Website",
          score: 0.5,
          timestamp: 1627936800000,
        },
        {
          description: "A website is on the internet.",
          name: "Website",
          score: 0.5,
          timestamp: 1627936800000,
        },
        {
          description: "The term website was coined by Tim Berners-Lee in 1990.",
          name: "Website",
          score: 0.5,
          timestamp: 1627936800000,
        },
      ]);
      console.log("summary", summary);
      expect(summary).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
      });
    } catch (error: any) {
      // Type assertion: Treat the error as 'any'
      const errorWithResponse = error as any;

      // Check if the error object has a property called 'response'
      if (errorWithResponse.response) {
        const errorMessage = errorWithResponse.response?.data?.error?.message;
        throw new Error(`OpenAI API returned an error: ${errorMessage}`);
      }
      // If it doesn't have a 'response' property, re-throw the original error
      throw error;
    }
  });
});

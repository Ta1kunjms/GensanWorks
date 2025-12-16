import fs from "fs";
import path from "path";
import YAML from "yaml";
import openapiToPostman from "openapi-to-postmanv2";

const openapiPath = path.resolve(process.cwd(), "openapi.yaml");
const outputPath = path.resolve(process.cwd(), "postman_collection.json");

function main() {
  if (!fs.existsSync(openapiPath)) {
    throw new Error(`openapi.yaml not found at ${openapiPath}`);
  }

  const rawSpec = fs.readFileSync(openapiPath, "utf8");
  const spec = YAML.parse(rawSpec);

  const converter = (openapiToPostman as any) || {};
  const convertFn = converter.convert || (converter.default && converter.default.convert) || converter;

  if (typeof convertFn !== "function") {
    throw new Error("openapi-to-postmanv2 convert function not found");
  }

  convertFn(
    {
      type: "json",
      data: JSON.stringify(spec),
    },
    {
      folderStrategy: "Tags",
      includeAuthInfoInExample: true,
      requestParametersResolution: "Example",
      exampleParametersResolution: "Example",
      retainIds: true,
    },
    (err: unknown, conversionResult: any) => {
      if (err) {
        throw err;
      }
      if (!conversionResult?.result) {
        throw new Error(conversionResult?.reason || "Failed to convert OpenAPI to Postman");
      }

      const collection = conversionResult.output?.[0]?.data;
      if (!collection) {
        throw new Error("No collection data returned by converter");
      }

      collection.info = {
        name: "GensanWorks API",
        description: "Postman collection generated from openapi.yaml",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      };

      collection.variable = collection.variable || [];
      const hasBaseUrl = collection.variable.some((v: any) => v.key === "baseUrl");
      if (!hasBaseUrl) {
        collection.variable.push({ key: "baseUrl", value: "http://localhost:5000", type: "string" });
      }

      fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf8");
      console.log(`[postman] Wrote collection to ${outputPath}`);
    }
  );
}

main();

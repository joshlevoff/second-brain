declare module "mammoth" {
  interface ConversionResult {
    value: string;
    messages: unknown[];
  }
  interface ArrayBufferInput {
    arrayBuffer: ArrayBuffer;
  }
  export function extractRawText(input: ArrayBufferInput): Promise<ConversionResult>;
  export function convertToHtml(input: ArrayBufferInput): Promise<ConversionResult>;
}

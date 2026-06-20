declare module "heic-convert" {
  type HeicConvertInput = {
    buffer: ArrayBuffer | Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  function convert(input: HeicConvertInput): Promise<ArrayBuffer>;
  export default convert;
}

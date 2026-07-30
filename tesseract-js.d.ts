declare module "tesseract.js" {
  export type LoggerMessage = {
    status: string;
    progress?: number;
  };

  export function recognize(
    image: File | Blob | string,
    langs?: string,
    options?: { logger?: (message: LoggerMessage) => void }
  ): Promise<{ data: { text: string } }>;
}

import { ConversionJob, ConversionResult } from "../types";

export interface ConversionProvider {
  id: string;
  name: string;
  canHandle(inputFormat: string, outputFormat: string): boolean;
  convert(job: ConversionJob): Promise<ConversionResult>;
}

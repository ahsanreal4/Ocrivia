import { BadRequestException } from '@nestjs/common';

const { ocrSpace } = require('ocr-space-api-wrapper');

export const performOcrRecognition = async (
  fileUrl: string,
): Promise<string> => {
  const res = await ocrSpace(fileUrl, {
    apiKey: process.env.OCR_API_KEY,
  });

  const parsedResults = res.ParsedResults;

  let text = '';

  if (parsedResults instanceof Array && parsedResults.length > 0) {
    parsedResults.map((result) => {
      const parsedText = result.ParsedText;

      if (typeof parsedText != 'string') return;

      text += result.ParsedText;
    });

    return text;
  } else {
    throw new BadRequestException('Error in parsing file in OCR');
  }
};

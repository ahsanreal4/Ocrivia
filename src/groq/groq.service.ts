import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from 'schemas/message.schema';
import { Roles } from 'types/roles';
const Groq = require('groq-sdk');

@Injectable()
export class GroqService {
  groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async getGroqChatCompletion(
    messages: Message[],
    newMessage: Message,
    fileContent: string,
  ) {
    const MODEL = 'mixtral-8x7b-32768';

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: Roles.SYSTEM,
            content:
              'You are an AI assitant that will parse W2 form for its users using OCR technology and then provide relative information from the form to the user. Hide only social security number. The file content is in the next message',
          },
          {
            role: Roles.SYSTEM,
            content: fileContent,
          },
          ...messages,
          newMessage,
        ],
        model: MODEL,
      });

      const choices = response.choices;

      if (choices instanceof Array && choices.length > 0) {
        return response.choices[0].message;
      }
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Error in generating response from AI');
    }
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Message } from './message.schema';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    default: [],
  })
  messages: Message[];

  @Prop({ required: false })
  fileId: string;

  @Prop({ required: false })
  fileUrl: string;

  @Prop({ required: false })
  fileContent: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

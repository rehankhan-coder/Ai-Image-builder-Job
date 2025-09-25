
export enum UserType {
  STUDENT = 'student',
  COMPANY = 'company',
}

export interface User {
  name: string;
  email: string;
  userType: UserType;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  tags: string[];
}

export enum MessageSender {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export interface ChatMessage {
    sender: MessageSender;
    text: string;
}

export enum AssistantMode {
    CHAT = 'chat',
    IMAGE = 'image',
    IMAGE_EDIT = 'image_edit',
}
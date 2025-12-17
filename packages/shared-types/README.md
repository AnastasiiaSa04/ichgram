# @ichgram/shared-types

Shared TypeScript types for the Ichgram monorepo.

## Description

This package contains shared TypeScript types and interfaces used across the Ichgram application, ensuring type safety and consistency between frontend and backend.

## Types Included

- **User Types**: User, UserProfile, UserBasic
- **Post Types**: Post, PostWithUser
- **Comment Types**: Comment, CommentWithUser
- **Message Types**: Message, MessageWithSender, Conversation, ConversationWithParticipants
- **Notification Types**: Notification, NotificationWithSender, NotificationType
- **API Types**: ApiResponse, PaginatedResponse, PaginationParams
- **Socket Types**: SocketEvents for real-time communication

## Usage

```typescript
import { User, Post, ApiResponse } from '@ichgram/shared-types';
```

## Building

```bash
npm run build
```

## Development

This package is part of the Ichgram monorepo and is automatically built when the monorepo is built.

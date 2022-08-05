export type Permisison = {
  name: string,
  action?: string,
  path: string
}

export type Role = {
  name: string,
  permissions: Array<Permisison>
  extend?: Array<string>
}

export const BASE_ROLES = {
  "roles": [
    {
      "name": "ROOT",
      "extend": ["ADMIN"],
      "permissions": []
    },
    {
      "name": "ADMIN",
      "extend": [],
      "permissions": [
        {
          "name": "fb_link.create.any",
          "action": "POST",
          "path": "/facebook/link"
        },
        {
          "name": "fb_conversation.read.any",
          "path": "adminAllFbConversations"
        },
        {
          "name": "fb_message.read.own",
          "path": "allFbMessages"
        },
        {
          "name": "zalo_link.read.any",
          "action": "GET",
          "path": "/zalo/link"
        },
        {
          "name": "zalo_link.create.any",
          "action": "POST",
          "path": "/zalo/link"
        },
        {
          "name": "zalo_conversation.read.any",
          "path": "adminAllZaloConversations"
        },
        {
          "name": "zalo_message.read.own",
          "path": "allZaloMessages"
        },
        {
          "name": "tele_link.create.any",
          "action": "POST",
          "path": "/telegram/link"
        },
        {
          "name": "tele_conversation.read.any",
          "path": "adminAllTelegramConversations"
        },
        {
          "name": "tele_message.read.own",
          "path": "allTeleMessages"
        },
        {
          "name": "tele_file.read.own",
          "path": "getTelegramFileInfo"
        },
        {
          "name": "assign_chat.update.any",
          "action": "POST",
          "path": "/admin/assign-chat"
        },
        {
          "name": "linked_pages.get.any",
          "action": "GET",
          "path": "/admin/linked_pages"
        },
        {
          "name": "me.read.own",
          "action": "GET",
          "path": "/me"
        },
        {
          "name": "me.update.own",
          "action": "PUT",
          "path": "/me"
        },
        {
          "name": "user.read.any",
          "action": "GET",
          "path": "/users"
        },
        {
          "name": "user.create.any",
          "action": "POST",
          "path": "/users"
        },
        {
          "name": "user.delete.any",
          "action": "DELETE",
          "path": "/users/{userId}"
        },
        {
          "name": "user.update.any",
          "action": "PUT",
          "path": "/users/{userId}"
        },
        {
          "name": "user.read.any",
          "action": "GET",
          "path": "/users/{userId}"
        },
      ]  
    },
    {
      "name": "SALE",
      "permissions": [
        {
          "name": "fb_conversation.read.own",
          "path": "allFbConversations"
        },
        {
          "name": "fb_message.read.own",
          "path": "allFbMessages"
        },
        {
          "name": "zalo_conversation.read.own",
          "path": "allZaloConversations"
        },
        {
          "name": "zalo_message.read.own",
          "path": "allZaloMessages"
        },
        {
          "name": "tele_conversation.read.own",
          "path": "allTelegramMessages"
        },
        {
          "name": "tele_message.read.own",
          "path": "allTeleMessages"
        },
        {
          "name": "tele_file.read.own",
          "path": "getTelegramFileInfo"
        },
        {
          "name": "message.send.own",
          "path": "sendMessage"
        },
        {
          "name": "presigned_url.create.any",
          "action": "GET",
          "path": "/presigned-url"
        },
        {
          "name": "file_upload.create.any",
          "action": "GET",
          "path": "/upload-file-to-chat-platform"
        },
        {
          "name": "me.read.own",
          "action": "GET",
          "path": "/me"
        },
        {
          "name": "me.update.own",
          "action": "PUT",
          "path": "/me"
        }
      ]  
    }
  ]
}

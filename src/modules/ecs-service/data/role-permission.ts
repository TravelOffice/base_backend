export type Statement = {
  action?: string,
  path: string
}
export type Permisison = {
  name: string,
  title: string,
  statements: Array<Statement>
}

export type Role = {
  name: string,
  permissions: Array<Permisison>
  extend?: Array<string>
}

export const BASE_ROLES = {
  roles: [
    {
      name: 'ROOT',
      extend: ['ADMIN'],
      permissions: [],
    },
    {
      name: 'ADMIN',
      extend: [],
      permissions: [
        {
          name: 'link_page',
          title: 'Link page',
          statements: [
            {
              path: '/facebook/link',
              action: 'POST',
            },
            {
              path: '/zalo/link',
              action: 'POST',
            },
            {
              action: 'POST',
              path: '/telegram/link',
            },
          ],
        },
        {
          name: 'unlink_page',
          title: 'Unlink page',
          statements: [
            {
              path: '/admin/linked_pages',
              action: 'DELETE',
            },
          ],
        },
        {
          name: 'assign_chat',
          title: 'Assign chat',
          statements: [
            {
              action: 'POST',
              path: '/admin/assign-chat',
            },
          ],
        },
        {
          name: 'view_all_conversations',
          title: 'View all conversations',
          statements: [
            {
              path: 'adminAllFbConversations',
            },
            {
              path: 'adminAllZaloConversations',
            },
            {
              path: 'adminAllTelegramConversations',
            },
            {
              action: 'GET',
              path: '/admin/linked_pages',
            },
          ],
        },
        {
          name: 'view_message',
          title: 'View message',
          statements: [
            {
              path: 'allFbMessages',
            },
            {
              path: 'allZaloMessages',
            },
            {
              path: 'allTelegramMessages',
            },
            {
              path: 'getTelegramFileInfo',
            },
          ],
        },
        {
          name: 'read_user',
          title: 'Read',
          statements: [
            {
              action: 'GET',
              path: '/users/{userId}',
            },
          ],
        },
        {
          name: 'create_user',
          title: 'Create',
          statements: [
            {
              action: 'POST',
              path: '/users',
            },
          ],
        },
        {
          name: 'update_user',
          title: 'Update',
          statements: [
            {
              action: 'PUT',
              path: '/users/{userId}',
            },
          ],
        },
        {
          name: 'delete_user',
          title: 'Delete',
          statements: [
            {
              action: 'DELETE',
              path: '/users/{userId}',
            },
          ],
        },
        {
          name: 'view_all_users',
          title: 'View all',
          statements: [
            {
              action: 'GET',
              path: '/users',
            },
          ],
        },
      ],
    },
    {
      name: 'SALE',
      permissions: [
        {
          name: 'view_assigned_conversations',
          title: 'View assigned conversations',
          statements: [
            {
              path: 'allFbConversations',
            },
            {
              path: 'allZaloConversations',
            },
            {
              path: 'allTelegramConversations',
            },
            {
              action: 'GET',
              path: '/admin/linked_pages',
            },
          ],
        },
        {
          name: 'view_message',
          title: 'View message',
          statements: [
            {
              path: 'allFbMessages',
            },
            {
              path: 'allZaloMessages',
            },
            {
              path: 'allTelegramMessages',
            },
            {
              path: 'getTelegramFileInfo',
            },
          ],
        },
        {
          name: 'send_message',
          title: 'Send message',
          statements: [
            {
              path: 'sendMessage',
            },
            {
              path: '/presigned-url',
              action: 'GET',
            },
            {
              action: 'GET',
              path: '/upload-file-to-chat-platform',
            },
          ],
        },
      ],
    },
  ],
};

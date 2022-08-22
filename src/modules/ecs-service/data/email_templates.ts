const DEFAULT_EMAIL_TEMPLATES = {
  aancs: {
    toAddresses: [],
    ccAddresses: [],
    subject: '[AutoAssign] Assigned new chat successfully!',
    html: '<h1>Hello {tenant} admins,</h1><p>New {chatPlatform} conversation has been assigned to sale named <b>{saleName}</b>.</p>',
    text: 'Hello {tenant} admins,\r\nNew {chatPlatform} conversation has been assigned to sale named to sale named {saleName}.',
  },
  aanas: {
    toAddresses: [],
    ccAddresses: [],
    subject: '[AutoAssign] No available sale to assign chat!',
    html: '<h1>Hello {tenant} admins,</h1><p>There is no sale to assign new {chatPlatform} conversation.</p><p>Please check your sales and assign them manually.</p>',
    text: 'Hello {tenant} admins,\r\nThere is no sale to assign new {chatPlatform} conversation.\r\nPlease check your sales and assign them manually.',
  },
  aanrnc: {
    toAddresses: [],
    ccAddresses: [],
    subject: '[AutoAssign] Assigned new conversation but sale does not response to user!',
    html: '<h1>Hello {tenant} admins,</h1><p>New {chatPlatform} conversation has been assigned to sale named <b>{saleName} but he/she does not response to user</b>.</p><p>Please check your sales and assign them manually.</p>',
    text: 'Hello {tenant} admins,\r\nNew {chatPlatform} conversation has been assigned to sale named to sale named {saleName} but he/she does not response to user.\r\nPlease check your sales and assign them manually.',
  },
};

export default DEFAULT_EMAIL_TEMPLATES;

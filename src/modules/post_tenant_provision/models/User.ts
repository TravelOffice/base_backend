export enum THEMES_TYPE {
  DARK = 'dark',
  LIGHT = 'light'
}
export enum LANGUAGES_TYPE {
  ENGLISH = 'en',
  VIETNAMESE = 'vi'
}
export enum ROLES_TYPE {
  ROOT = "ROOT",
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  username: string,
  name: string,
  firstName?: string,
  lastName?: string,
  phoneNumber: string,
  email: string,
  tenant: string,
  role: ROLES_TYPE,
  address?: string,
  avatar?: string,
  settings: {
    language?: LANGUAGES_TYPE,
    theme?: THEMES_TYPE
  },
  createdAt: number,
  updatedAt: number,
}

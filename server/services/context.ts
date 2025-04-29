import { Response } from 'express'

export interface Context {
  username?: string
  token?: string
}

export function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

import { Request as ExpressRequest } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'

interface JwtPayload {
  _id: string
}

export interface Request
  extends ExpressRequest<
    ParamsDictionary,
    any,
    any,
    Query,
    Record<string, any>
  > {
  payload: JwtPayload
}

import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

import { JWT_SECRET } from "../../../core/constants"
import { ResponseMessages } from "../core/messages"
import { UserModel } from "../models/user"

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
   const token = req.headers["authorization"]?.replace("Bearer ", "")?.trim()
   if (!token) {
      return res.status(400).send({ message: ResponseMessages.AUTH_INVALID })
   }

   try {
      const email = jwt.verify(token, JWT_SECRET)
      if (!email) {
         return res.status(400).send({ message: ResponseMessages.AUTH_INVALID })
      }

      const user = await UserModel.findOne({ email: email })
      if (!user) {
         return res.status(404).send({ message: ResponseMessages.AUTH_USER_DOES_NOT_EXIST })
      }

      ;(req as any)["user"] = user

      next()
   } catch (error) {
      res.status(401).send({ message: ResponseMessages.AUTH_INVALID })
   }
}

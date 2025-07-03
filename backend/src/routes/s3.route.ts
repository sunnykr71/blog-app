import { Router } from 'express'
import s3Controller from '../controllers/s3.controller'

const s3Router = Router()

s3Router.post('/get-signed-put-url', s3Controller.getSignedPutUrl)

export default s3Router

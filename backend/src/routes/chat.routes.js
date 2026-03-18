import { Router } from 'express';
import { sendMessage } from '../controllers/chat.controller';
import { authUser } from '../middlewares/auth.middleware';

const chatRouter = Router();

chatRouter.post('/message', authUser, sendMessage)

export default chatRouter;
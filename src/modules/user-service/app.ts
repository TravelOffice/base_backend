import cors from 'cors';
import express, { Request, Response } from 'express';
import compression from 'compression';
import { createUserUseCase } from './useCases';
import { User } from './models/User';

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/users', async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const user : User = {
      username: body.username,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    };
    const createdUser = await createUserUseCase.invoke(user);
    res.json(createdUser);
  } catch (e: any) {
    if (e.name === 'UsernameExistsException') {
      res.json({ message: 'Username already exists!' });
    } else {
      res.json({ message: `${e.name}: ${e.message}` });
    }
  }
});

export default app;

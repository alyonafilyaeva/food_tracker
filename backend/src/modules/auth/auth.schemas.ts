import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
});

export type Credentials = z.infer<typeof credentialsSchema>;

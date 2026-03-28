import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

let app: any;

export default async (req: VercelRequest, res: VercelResponse) => {
  // Initialize app once and reuse for performance
  if (!app) {
    app = await createApp();
  }

  // Handle the request through Express
  return app(req, res);
};

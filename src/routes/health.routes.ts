import { Router, Request, Response } from "express";

const router = Router();

router
  .get("/", async (req: Request, res: Response) => {   
      res.status(200).json({ status: "OK", uptime: process.uptime() });   
  });

export default router;

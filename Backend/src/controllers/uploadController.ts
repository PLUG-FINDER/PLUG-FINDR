import { Request, Response } from "express";
import { uploadToGridFS } from "../utils/gridfs";

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    // Upload files to GridFS and get file IDs
    const urls = await Promise.all(
      files.map(async (file) => {
        if (!file.buffer) {
          throw new Error("File buffer is missing");
        }
        const fileId = await uploadToGridFS(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        return `/api/images/${fileId}`;
      })
    );

    res.status(201).json({ urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




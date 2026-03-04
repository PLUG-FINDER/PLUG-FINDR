import { Request, Response } from "express";
import { downloadFromGridFS } from "../utils/gridfs";

/**
 * Serve an image from GridFS by file ID
 */
export const getImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ message: "File ID is required" });
      return;
    }

    console.log(`[Image] Attempting to serve image with ID: ${fileId}`);

    const { buffer, contentType } = await downloadFromGridFS(fileId);

    console.log(`[Image] Successfully loaded image: ${fileId}, size: ${buffer.length} bytes, type: ${contentType}`);

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Send the image buffer
    res.send(buffer);
  } catch (error: any) {
    console.error(`[Image] Error serving image ${req.params.fileId}:`, error.message || error);
    if (error.message?.includes("FileNotFound") || error.message?.includes("Invalid file ID")) {
      res.status(404).json({ message: "Image not found", fileId: req.params.fileId });
    } else {
      res.status(500).json({ message: "Error serving image", error: error.message });
    }
  }
};


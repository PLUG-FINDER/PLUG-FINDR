import mongoose from "mongoose";
import { Readable } from "stream";

// Use mongoose's connection directly to avoid BSON version conflicts
let gridFSBucket: any = null;

/**
 * Get or create GridFS bucket for storing images
 * Using mongoose's connection to ensure BSON compatibility
 */
const getGridFSBucket = (): any => {
  if (!gridFSBucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not connected");
    }
    // Workaround for BSON version conflict:
    // Use mongoose's connection client to get the GridFSBucket constructor
    // that matches mongoose's BSON version
    const client = mongoose.connection.getClient();
    // Get the mongodb module that mongoose is using (from node_modules/mongoose/node_modules/mongodb)
    // This ensures we use the same BSON version
    const mongooseMongoPath = require.resolve('mongodb', { paths: [require.resolve('mongoose')] });
    const mongooseMongo = require(mongooseMongoPath);
    const GridFSBucket = mongooseMongo.GridFSBucket;
    gridFSBucket = new GridFSBucket(db, { bucketName: "images" });
  }
  return gridFSBucket;
};

/**
 * Convert a string ID to an ObjectId compatible with the current BSON version
 * Uses mongoose's ObjectId which is compatible with mongoose's connection
 */
const toObjectId = (id: string): any => {
  // Always use mongoose's ObjectId - it's compatible with mongoose's connection
  return new mongoose.Types.ObjectId(id);
};

/**
 * Upload a file buffer to GridFS
 * @param buffer - File buffer
 * @param filename - Original filename
 * @param contentType - MIME type (e.g., 'image/jpeg')
 * @returns GridFS file ID
 */
export const uploadToGridFS = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> => {
  const bucket = getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    // Use metadata to store contentType
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    } as any);

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    readable.pipe(uploadStream);

    uploadStream.on("error", (error: any) => {
      reject(error);
    });

    uploadStream.on("finish", () => {
      // Convert the uploaded file ID to string
      // The ID is already a mongoose ObjectId, so we can use it directly
      const fileId = uploadStream.id instanceof mongoose.Types.ObjectId 
        ? uploadStream.id.toString() 
        : String(uploadStream.id);
      resolve(fileId);
    });
  });
};

/**
 * Download a file from GridFS by ID
 * @param fileId - GridFS file ID
 * @returns File buffer and metadata
 */
export const downloadFromGridFS = async (
  fileId: string
): Promise<{ buffer: Buffer; contentType: string; filename: string }> => {
  const bucket = getGridFSBucket();
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error("Invalid file ID format");
  }
  
  // Convert to ObjectId using mongoose (which is compatible with the connection's BSON)
  const _id = toObjectId(fileId);

  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(_id);

    const chunks: Buffer[] = [];
    let contentType = "application/octet-stream";
    let filename = "file";

    downloadStream.on("file", (file: any) => {
      contentType = file.metadata?.contentType || file.contentType || "application/octet-stream";
      filename = file.filename || "file";
    });

    downloadStream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    downloadStream.on("error", (error: any) => {
      if (error.code === 26 || error.message?.includes("FileNotFound")) {
        reject(new Error("FileNotFound"));
      } else {
        reject(error);
      }
    });

    downloadStream.on("end", () => {
      resolve({
        buffer: Buffer.concat(chunks),
        contentType,
        filename,
      });
    });
  });
};

/**
 * Check if a file exists in GridFS
 * @param fileId - GridFS file ID
 * @returns True if file exists
 */
export const fileExistsInGridFS = async (fileId: string): Promise<boolean> => {
  try {
    const bucket = getGridFSBucket();
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return false;
    }
    const _id = toObjectId(fileId);
    const files = await bucket.find({ _id } as any).toArray();
    return files.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Delete a file from GridFS
 * @param fileId - GridFS file ID
 */
export const deleteFromGridFS = async (fileId: string): Promise<void> => {
  const bucket = getGridFSBucket();
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error("Invalid file ID format");
  }
    const _id = toObjectId(fileId);
    await bucket.delete(_id);
};


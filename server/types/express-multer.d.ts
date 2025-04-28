declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }

  interface Request {
    files?: {
      [fieldname: string]: Multer.File[];
    };
    file?: Multer.File;
  }
}
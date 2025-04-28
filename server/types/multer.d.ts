declare module 'multer' {
  import { Request } from 'express';
  
  namespace multer {
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
    
    interface Options {
      dest?: string;
      storage?: StorageEngine;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      fileFilter?(req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void): void;
      preservePath?: boolean;
    }
    
    interface StorageEngine {
      _handleFile(req: Request, file: File, callback: (error?: any, info?: Partial<File>) => void): void;
      _removeFile(req: Request, file: File, callback: (error: Error) => void): void;
    }
    
    interface DiskStorageOptions {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?(req: Request, file: File, callback: (error: Error | null, filename: string) => void): void;
    }
    
    interface MemoryStorageOptions { }
    
    interface DiskStorage extends StorageEngine {
      destination: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename(req: Request, file: File, callback: (error: Error | null, filename: string) => void): void;
    }
    
    interface MemoryStorage extends StorageEngine { }
    
    function diskStorage(options: DiskStorageOptions): DiskStorage;
    function memoryStorage(options?: MemoryStorageOptions): MemoryStorage;
  }
  
  function multer(options?: multer.Options): {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string, maxCount?: number }>): any;
    none(): any;
  };
  
  export = multer;
}
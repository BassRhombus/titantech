import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}

export async function ensureUploadDir(dir: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', 'uploads', dir);
  await fs.mkdir(fullPath, { recursive: true });
}

export function validateImageFile(file: { mimetype: string; originalFilename: string; size: number }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }

  const ext = path.extname(file.originalFilename || '').toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push('File extension is not allowed');
  }

  if (file.originalFilename?.includes('..') || file.originalFilename?.includes('/') || file.originalFilename?.includes('\\')) {
    errors.push('Invalid filename');
  }

  return { valid: errors.length === 0, errors };
}

export async function parseFormData(request: Request): Promise<{ fields: Record<string, string>; file: { filepath: string; mimetype: string; originalFilename: string; size: number; newFilename: string } | null }> {
  // Dynamic import of formidable
  const formidable = (await import('formidable')).default;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  await fs.mkdir(uploadDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir,
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      filter: ({ mimetype }: { mimetype: string | null }) => {
        return mimetype ? ALLOWED_MIME_TYPES.includes(mimetype) : false;
      },
    });

    // Convert Request to IncomingMessage-like
    const readable = request.body;
    if (!readable) {
      return resolve({ fields: {}, file: null });
    }

    // Create a mock IncomingMessage from the Request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const mockReq = Object.assign(
      new (require('stream').Readable)({
        read() {},
      }),
      {
        headers,
        method: request.method,
        url: '',
      }
    ) as unknown as IncomingMessage;

    // Pipe the body into the mock request
    const reader = readable.getReader();
    function pump() {
      reader.read().then(({ done, value }: { done: boolean; value?: Uint8Array }) => {
        if (done) {
          (mockReq as any).push(null);
          return;
        }
        (mockReq as any).push(value);
        pump();
      });
    }
    pump();

    form.parse(mockReq, (err: any, fields: any, files: any) => {
      if (err) return reject(err);

      const parsedFields: Record<string, string> = {};
      for (const [key, val] of Object.entries(fields)) {
        parsedFields[key] = Array.isArray(val) ? val[0] : val;
      }

      const fileArr = files.imageFile || files.file || Object.values(files)[0];
      const file = fileArr?.[0];

      if (file) {
        resolve({
          fields: parsedFields,
          file: {
            filepath: file.filepath,
            mimetype: file.mimetype || '',
            originalFilename: file.originalFilename || 'upload',
            size: file.size || 0,
            newFilename: file.newFilename || '',
          },
        });
      } else {
        resolve({ fields: parsedFields, file: null });
      }
    });
  });
}

export async function moveUpload(tempPath: string, destDir: string, filename: string): Promise<string> {
  const destFolder = path.join(process.cwd(), 'public', 'uploads', destDir);
  await fs.mkdir(destFolder, { recursive: true });
  const destPath = path.join(destFolder, filename);
  await fs.rename(tempPath, destPath);
  return `/uploads/${destDir}/${filename}`;
}

export async function deleteUpload(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
  } catch {
    // Silently ignore if file doesn't exist
  }
}

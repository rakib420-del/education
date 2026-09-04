import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('storage')
export class StorageController {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  @Get('local/:filename')
  serveLocalFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('ফাইল পাওয়া যায়নি');
    }

    return res.sendFile(filePath);
  }

  @Get('public/:filename')
  servePublicFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(this.uploadDir, 'public', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('ফাইল পাওয়া যায়নি');
    }

    return res.sendFile(filePath);
  }
}

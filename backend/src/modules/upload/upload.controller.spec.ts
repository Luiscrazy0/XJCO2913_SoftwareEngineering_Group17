import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(() => {
    controller = new UploadController();
  });

  it('returns metadata for an uploaded feedback image', () => {
    const file = {
      filename: 'generated-name.png',
      originalname: 'damage-photo.png',
      size: 1024,
    } as Express.Multer.File;

    expect(controller.uploadImage(file)).toEqual({
      url: '/uploads/feedbacks/generated-name.png',
      originalName: 'damage-photo.png',
      size: 1024,
    });
  });

  it('rejects missing uploads', () => {
    expect(() =>
      controller.uploadImage(undefined as unknown as Express.Multer.File),
    ).toThrow(BadRequestException);
  });
});

function createFileFromMulterFile({ buffer, mimetype, originalname }: Express.Multer.File) {
  return new File([new Uint8Array(buffer)], originalname, {
    type: mimetype,
  });
}

export { createFileFromMulterFile };

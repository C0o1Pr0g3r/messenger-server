const MimeType = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
} as const;
type MimeType = (typeof MimeType)[keyof typeof MimeType];

const ExtensionByMimeType = {
  [MimeType.gif]: "gif",
  [MimeType.jpeg]: "jpeg",
  [MimeType.png]: "png",
  [MimeType.svg]: "svg",
} as const satisfies Record<MimeType, string>;
type ExtensionByMimeType = (typeof ExtensionByMimeType)[keyof typeof ExtensionByMimeType];

export { ExtensionByMimeType, MimeType };

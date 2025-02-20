import { Attachment } from "__generated__/__types__";


export function getFormattedImage(image: Attachment | undefined) {
  if (!image) return null;
  const { __typename, ...rest } = image;
  return { ...rest };
}

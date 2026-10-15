// Strapi returns every media with all its generated formats and their metadata (hash, mime,
// provider...), and the store ends up serialized in the payload of every page. Only what the
// site uses is kept, in the same shape, so `media.data.attributes.formats.xlarge.url` still works.

const IMAGE_FORMATS = ['xxlarge', 'xlarge', 'large'];

const pickFormat = (format) => ({
  url: format.url,
  width: format.width,
  height: format.height,
});

const slimMediaAttributes = (attributes) => {
  const formats = attributes.formats || null;

  return {
    url: attributes.url,
    alternativeText: attributes.alternativeText,
    width: attributes.width,
    height: attributes.height,
    mime: attributes.mime,
    formats: formats
      ? Object.fromEntries(IMAGE_FORMATS.filter((key) => formats[key]).map((key) => [key, pickFormat(formats[key])]))
      : null,
  };
};

const isMediaAttributes = (value) => 'formats' in value && 'mime' in value && 'url' in value;

// Walks a strapi response and slims every media found in it
export const slimMedia = (value) => {
  if (Array.isArray(value)) return value.map(slimMedia);
  if (!value || typeof value !== 'object') return value;
  if (isMediaAttributes(value)) return slimMediaAttributes(value);

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, slimMedia(item)]));
};

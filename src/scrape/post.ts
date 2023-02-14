import { Submission } from 'snoowrap';
import {
  ImagePreview,
  ImagePreviewSource,
  Media,
} from 'snoowrap/dist/objects/Submission';
import { MediaSource, RawMedia } from './../database/entities/media.entity';
import { fastImageDetails, fastImageMimeType } from './logic';
import { isImagePreview, isImageSource, isURL } from './validation';

type MediaAlike = ImagePreview | ImagePreviewSource | Media | string;

/**
 * Resolve any media structure to a common base interface containing the url, width, height and mimetype
 */
async function resolveMediaAlike(
  value: MediaAlike,
  forceImageDetailsFetching = false,
): Promise<MediaSource[]> {
  if (isURL(value)) {
    // valid is a valid url string
    //? this is not particularly useful since the ImagePreview structure contains the 'source' of posts which contain images
    if (forceImageDetailsFetching) {
      const details = await fastImageDetails(value);
      return [{ url: value, ...details }];
    }
    return [{ url: value, width: null, height: null, mimetype: null }];
  }
  if (isImageSource(value)) {
    // value is a valid ImagePreviewSource structure
    const { url, width, height } = value;
    if (forceImageDetailsFetching) {
      const mimetype = await fastImageMimeType(url);
      return [{ url, width, height, mimetype }];
    }
    return [{ url, width, height, mimetype: null }];
  }
  if (isImagePreview(value)) {
    // value is a valid ImagePreview structure
    return resolveMediaAlike(value.source);
    // can recursively resolve all preview.resolutions[] variants
  }
  // value is a valid Media structure
  // TODO extract some arbitrary ammount of images from the media structure
  return [];
}

/**
 * Safe wrapper of resolveMediaAlike
 */
const mediaOr = async (value: MediaAlike, or: MediaSource[]) => {
  try {
    return await resolveMediaAlike(value);
  } catch (error) {
    console.error(error);
    return or;
  }
};

/**
 * Specialized version of mediaOr
 */
const mediaOrEmpty = async (value: MediaAlike) => mediaOr(value, []);

export async function extractPostMedia(post: Submission): Promise<RawMedia[]> {
  // any of url, media[], preview.images[], thumbnail, url_overridden_by_dest
  const sources: MediaAlike[] = [...post.preview.images];
  const parsedSources = await Promise.all(sources.map(mediaOrEmpty));
  return parsedSources
    .filter((source) => source.length > 0)
    .flat()
    .map((source) => ({
      ...source,
      post_id: post.id,
      post_hint: post.post_hint,
      subreddit: post.subreddit.display_name,
      upvote_ratio: post.upvote_ratio,
      ups: post.ups,
      downs: post.downs,
      score: post.score,
    }));
}

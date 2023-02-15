import { EntityRepository } from '@mikro-orm/sqlite';
import { injectable, inject } from 'inversify';
import { MediaEntity } from '../database/entities/media.entity';
import TYPES from '../di';
import { args } from '../env/argparse';
import { assureDirectoryExists, imageDetails, saveJPEG } from '../utils';
import { fetchImageBuffer } from './fetcher';
import path from 'node:path';
import { makeAbortable } from '../scrape/logic';

interface PaginationOpts {
  offset: number;
  limit: number;
}

@injectable()
export class DatasetFetcher {
  @inject(TYPES.MediaRepository)
  private mediaRepository!: EntityRepository<MediaEntity>;
  public abortController = new AbortController();

  public async start() {
    const [job, abort] = makeAbortable(this.fetchLoop());
    this.abortController = abort;
    await job;
  }

  public cleanup() {
    this.abortController.abort();
  }

  private async fetchLoop() {
    let pagination: PaginationOpts = {
      offset: 0,
      limit: 20,
    };

    for (;;) {
      const [mediaBatch, nextPagination] = await this.fetchNextBatch(
        pagination,
      );

      if (mediaBatch.length === 0) break;

      pagination = nextPagination;
      if (args.debug) console.log(`Fetching ${mediaBatch.length} media`);

      const parallelFetching = mediaBatch.map((media) =>
        (async () => {
          media = this.mediaRepository.merge(media);

          const imageBuffer = await fetchImageBuffer(media.url);
          if (args.debug) console.log(`Fetched ${media.url}`);

          const details = imageDetails(imageBuffer);

          const directory = assureDirectoryExists(
            path.join(args.dataset, media.subreddit, media.post_id),
          );

          try {
            const outputResults = await saveJPEG(
              imageBuffer,
              media.id.toString(),
              directory,
            );

            if (!media.size || outputResults.size !== media.size)
              media.size = outputResults.size;
            media.is_cached = true;
            if (!media.width) media.width = details.width;
            if (!media.height) media.height = details.height;
            if (!media.mimetype) media.mimetype = details.mimetype;

            await this.mediaRepository.persistAndFlush(media);
          } catch (err) {
            if (args.debug) console.error(`Error parsing ${media.url}`, err);
          }
        })(),
      );

      await Promise.all(parallelFetching);

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  private async fetchNextBatch({
    offset,
    limit,
  }: PaginationOpts): Promise<[MediaEntity[], PaginationOpts]> {
    // TODO because each batch is updated to is_cached = true there is no real need for pagination. just fetch the first 20 non cached images
    //? if one image fails to cache, it will fail to cache forever if pagination is not used
    //? worst case, a full batch can be filled with images that fail to cache, resulting in an infinite loop :(
    const mediaBatch = await this.mediaRepository
      .createQueryBuilder('m')
      .select('*')
      .where({
        url: { $like: `%webp%` },
        width: { $gt: 1500, $lt: 4000 },
        height: { $gt: 1000, $lt: 4000 },
        is_cached: false,
      })
      .offset(offset)
      .limit(limit)
      .execute();

    return [
      mediaBatch,
      {
        offset: offset + limit,
        limit,
      },
    ];
  }
}

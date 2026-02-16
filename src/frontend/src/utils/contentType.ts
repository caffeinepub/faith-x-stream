import { ContentType } from '../backend';

export function getContentTypeLabel(contentType: ContentType): string {
  switch (contentType) {
    case ContentType.movie:
      return 'Movie';
    case ContentType.film:
      return 'Film';
    case ContentType.podcast:
      return 'Podcast';
    case ContentType.documentary:
      return 'Documentary';
    case ContentType.faithBased:
      return 'Faith-Based';
    case ContentType.music:
      return 'Music';
    case ContentType.educational:
      return 'Educational';
    case ContentType.news:
      return 'News';
    case ContentType.tvSeries:
      return 'TV Series';
    case ContentType.series:
      return 'Series';
    default:
      return 'Content';
  }
}

export function isMovieOrFilm(contentType: ContentType): boolean {
  return contentType === ContentType.movie || contentType === ContentType.film;
}

export function isPodcast(contentType: ContentType): boolean {
  return contentType === ContentType.podcast;
}

export function getMovieFilmTypes(): ContentType[] {
  return [ContentType.movie, ContentType.film];
}

export function getPodcastTypes(): ContentType[] {
  return [ContentType.podcast];
}

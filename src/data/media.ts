const MEDIA_BASE = '/media'

export const HEADSHOT_SRC = `${MEDIA_BASE}/yazmine_headshot.jpg`

export const HERO_VIDEOS = [
  `${MEDIA_BASE}/yazmine_videos/yazmine_1.mp4`,
  `${MEDIA_BASE}/yazmine_videos/yazmine_2.mp4`,
  `${MEDIA_BASE}/yazmine_videos/yazmine_3.mp4`,
  `${MEDIA_BASE}/yazmine_videos/yazmine_4.mp4`,
] as const

const GALLERY_PHOTO_FILES = [
  '660185551_18098060902952189_6228437523264872039_n.jpg',
  '661590107_18098717533952189_2264865588961335296_n.jpg',
  '669924906_18098413162952189_7034257961637150065_n.jpg',
  '670879322_18099525919952189_7654273723284396993_n.jpg',
  '689852472_18101474044952189_441487407840505549_n.jpg',
  '710299115_18103323424952189_5692031398214610925_n.jpg',
  '720049493_18104263054952189_2708389772877476892_n.jpg',
  '730417245_18106420723952189_6447004299466172736_n.jpg',
  '731058562_18106573831952189_7082829454463301201_n.jpg',
  '746059371_18107729398952189_5619816281452907777_n.jpg',
] as const

export const GALLERY_PHOTOS = GALLERY_PHOTO_FILES.map(
  (file) => `${MEDIA_BASE}/yazmine_ig_pics/${file}`,
) as readonly string[]

export type GalleryItem =
  | { kind: 'image'; src: string }
  | { kind: 'video'; src: string }

export function buildGalleryItems(): GalleryItem[] {
  const items: GalleryItem[] = []
  let photoIndex = 0
  let videoIndex = 0

  while (photoIndex < GALLERY_PHOTOS.length || videoIndex < HERO_VIDEOS.length) {
    if (videoIndex < HERO_VIDEOS.length) {
      items.push({ kind: 'video', src: HERO_VIDEOS[videoIndex] })
      videoIndex += 1
    }
    for (let i = 0; i < 2 && photoIndex < GALLERY_PHOTOS.length; i += 1) {
      items.push({ kind: 'image', src: GALLERY_PHOTOS[photoIndex] })
      photoIndex += 1
    }
  }

  return items
}

export const GALLERY_ITEMS = buildGalleryItems()

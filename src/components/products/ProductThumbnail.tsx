import { ImagePlaceholder } from '@/components/items/ImagePlaceholder'
import { useListProductPhotos, getPhotoFileUrl } from '@/lib/data/photos'
import { IconSize } from '@/lib/enums/icon-size.enum'

interface ProductThumbnailProps {
  productId: string
  alt?: string
  className?: string
}

/**
 * Displays the first photo of a product, or an ImagePlaceholder if none exist.
 * Queries photos lazily with a long stale time to avoid excessive API calls.
 */
export function ProductThumbnail({
  productId,
  alt = 'Product',
  className = '',
}: ProductThumbnailProps): React.JSX.Element {
  const { data: photos } = useListProductPhotos(productId, {
    query: { staleTime: 5 * 60 * 1000 }, // 5 minutes
  })

  const firstPhoto = photos?.[0]

  if (firstPhoto) {
    return (
      <img
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        src={getPhotoFileUrl(firstPhoto.id)}
      />
    )
  }

  return <ImagePlaceholder iconSize={IconSize.SM} />
}

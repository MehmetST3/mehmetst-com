type ResponsiveImageProps = Readonly<{
  base: string
  alt: string
  width: number
  height: number
  className?: string
  eager?: boolean
  sizes: string
}>

export function ResponsiveImage({
  base,
  alt,
  width,
  height,
  className,
  eager = false,
  sizes,
}: ResponsiveImageProps) {
  return (
    <img
      className={className}
      src={`/images/${base}-960.webp`}
      srcSet={`/images/${base}-640.webp 640w, /images/${base}-960.webp 960w, /images/${base}-1440.webp 1440w`}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding={eager ? 'sync' : 'async'}
    />
  )
}

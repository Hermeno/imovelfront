import { Box, Flex, Text, IconButton, Spinner, useToast } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { propertiesApi } from '../api/properties'

interface UploadedImage { id: string; url: string; alt: string | null; order: number }

interface Props {
  propertyId?: string
  initialImages?: UploadedImage[]
  onChange?: (images: UploadedImage[]) => void
}

export function ImageUploader({ propertyId, initialImages = [], onChange }: Props) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  async function handleFiles(files: FileList | null) {
    if (!files || !propertyId) return
    const arr = Array.from(files)
    if (arr.length + images.length > 20) {
      toast({ title: 'Maximum 20 images per property', status: 'warning', duration: 3000 })
      return
    }
    setUploading(true)
    try {
      const res = await propertiesApi.uploadImages(propertyId, arr)
      if (res.success && res.data) {
        const next = [...images, ...res.data.images.map((img, i) => ({
          id: img.id, url: img.url, alt: null, order: images.length + i + 1,
        }))]
        setImages(next)
        onChange?.(next)
        toast({ title: `${arr.length} image${arr.length > 1 ? 's' : ''} uploaded`, status: 'success', duration: 2000 })
      }
    } catch {
      toast({ title: 'Upload failed', status: 'error', duration: 3000 })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(img: UploadedImage) {
    if (!propertyId) return
    setDeletingId(img.id)
    try {
      await propertiesApi.deleteImage(propertyId, img.id)
      const next = images.filter((i) => i.id !== img.id)
      setImages(next)
      onChange?.(next)
    } catch {
      toast({ title: 'Error deleting image', status: 'error', duration: 3000 })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Box>
      {/* Drop zone */}
      <Box
        border="2px dashed" borderColor="neutral.200" borderRadius="12px"
        p="24px" textAlign="center" cursor="pointer"
        _hover={{ borderColor: 'brand.400', bg: 'brand.50' }}
        transition="all 0.15s"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Flex align="center" justify="center" gap="10px">
            <Spinner size="sm" color="brand.600" />
            <Text fontSize="13px" color="neutral.500">Uploading…</Text>
          </Flex>
        ) : (
          <>
            <Text fontSize="24px" mb="8px">📷</Text>
            <Text fontSize="13px" fontWeight="500" color="neutral.600">
              {propertyId ? 'Click or drag photos here' : 'Save the property first to upload images'}
            </Text>
            <Text fontSize="12px" color="neutral.400" mt="4px">JPEG, PNG, WebP · max 5 MB each · up to 20</Text>
          </>
        )}
      </Box>

      {/* Preview grid */}
      {images.length > 0 && (
        <Flex gap="8px" flexWrap="wrap" mt="12px">
          {images.map((img) => (
            <Box
              key={img.id} position="relative" w="80px" h="80px"
              borderRadius="8px" overflow="hidden" border="1px solid" borderColor="neutral.100"
              flexShrink={0}
            >
              <Box as="img" src={img.url} w="100%" h="100%" objectFit="cover" />
              {deletingId === img.id ? (
                <Flex position="absolute" inset={0} bg="whiteAlpha.800" align="center" justify="center">
                  <Spinner size="xs" />
                </Flex>
              ) : (
                <IconButton
                  aria-label="Remove" size="xs" position="absolute" top="2px" right="2px"
                  bg="blackAlpha.600" color="white" borderRadius="full" minW="18px" h="18px"
                  _hover={{ bg: 'red.500' }}
                  onClick={() => handleDelete(img)}
                  icon={
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                />
              )}
              {img.order === 1 && (
                <Box
                  position="absolute" bottom="2px" left="2px"
                  bg="brand.600" color="white" px="4px" py="1px" borderRadius="4px" fontSize="9px" fontWeight="700"
                >
                  COVER
                </Box>
              )}
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )
}

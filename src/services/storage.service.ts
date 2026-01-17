import { supabase } from '@/lib/supabase'

const BUCKETS = {
  SHEEP_IMAGES: 'sheep-images',
  AVATARS: 'avatars'
} as const

export const storageService = {
  async uploadSheepImage(file: File, sheepId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${sheepId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.SHEEP_IMAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.SHEEP_IMAGES)
      .getPublicUrl(filePath)

    return publicUrl
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(filePath)

    return publicUrl
  },

  async deleteSheepImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]

      const { error } = await supabase.storage
        .from(BUCKETS.SHEEP_IMAGES)
        .remove([fileName])

      if (error) throw error
      return true
    } catch {
      return false
    }
  },

  async deleteAvatar(imageUrl: string): Promise<boolean> {
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]

      const { error } = await supabase.storage
        .from(BUCKETS.AVATARS)
        .remove([fileName])

      if (error) throw error
      return true
    } catch {
      return false
    }
  },

  getPublicUrl(bucket: keyof typeof BUCKETS, path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS[bucket])
      .getPublicUrl(path)

    return publicUrl
  }
}

export default storageService

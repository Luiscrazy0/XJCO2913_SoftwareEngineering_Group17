import axiosClient from '../utils/axiosClient'

interface UploadResponse {
  url: string
  originalName: string
  size: number
}

/**
 * Upload an image file and return the accessible URL.
 * Uses a separate axios call so Content-Type is auto-detected as multipart/form-data.
 */
export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<{
      success: boolean
      data: UploadResponse
      message?: string
    }>('/upload/feedback-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!response.data.success) {
      throw new Error(response.data.message || '图片上传失败')
    }

    return response.data.data
  },
}

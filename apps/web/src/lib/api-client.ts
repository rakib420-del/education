import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://education-api-two.vercel.app';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const apiClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    if (typeof window !== 'undefined') {
      const isApiAdmin = config.url?.includes('/admin');
      const isPageAdmin = window.location.pathname.startsWith('/admin');
      const token = (isApiAdmin || isPageAdmin)
        ? localStorage.getItem('elearn_admin_at')
        : Cookies.get('elearn_at');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: redirect to login on 401 ──
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
          localStorage.removeItem('elearn_admin_at');
          localStorage.removeItem('elearn_admin_user');
          window.location.href = '/admin/login';
        } else if (!path.startsWith('/login') && !path.startsWith('/admin')) {
          import('js-cookie').then((Cookies) => {
            Cookies.default.remove('elearn_at');
            Cookies.default.remove('elearn_user');
          });
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// ── Typed helpers ──────────────────────────────────────

export const api = {
  // Auth
  register:        (data: any)              => apiClient.post('/auth/register', data),
  login:           (data: any)              => apiClient.post('/auth/login', data),
  confirmLogin:    (data: any)              => apiClient.post('/auth/login/confirm', data),
  verifyOtp:       (data: any)              => apiClient.post('/auth/verify-otp', data),
  refreshToken:    (data: any)              => apiClient.post('/auth/refresh', data),
  logout:          (data: any)              => apiClient.post('/auth/logout', data),
  forgotPassword:  (data: any)             => apiClient.post('/auth/forgot-password', data),
  resetPassword:   (data: any)             => apiClient.post('/auth/reset-password', data),
  resendOtp:       (data: any)             => apiClient.post('/auth/resend-otp', data),

  // Content
  getContent:      (params?: any)           => apiClient.get('/content', { params }),
  getContentBySlug:(slug: string)           => apiClient.get(`/content/${slug}`),
  getAffiliate:    ()                       => apiClient.get('/content/affiliate'),
  trackAffiliate:  (id: string)             => apiClient.post(`/content/affiliate/${id}/click`),

  // Orders
  createOrder:     (data: FormData)         => apiClient.post('/orders', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyOrders:     ()                       => apiClient.get('/orders/me'),

  // Users
  getMe:           ()                       => apiClient.get('/users/me'),
  updateProfile:   (data: any)              => apiClient.patch('/users/me', data),
  updateMe:        (data: any)              => apiClient.patch('/users/me', data),
  deleteUserAccount:()                      => apiClient.delete('/users/me'),
  getSessions:     ()                       => apiClient.get('/users/me/sessions'),
  getMyContent:    ()                       => apiClient.get('/users/me/content'),
  updateProgress:  (lessonId: string, watchedSeconds: number) =>
                                               apiClient.post(`/users/me/progress/${lessonId}`, { watchedSeconds }),

  // Stream
  getLessonUrl:         (lessonId: string)            => apiClient.get(`/stream/lesson/${lessonId}`),
  getSignedStreamUrl:   (_contentId: string, lessonId: string) => apiClient.get(`/stream/lesson/${lessonId}`),
  getChapterPages:      (chapterId: string)           => apiClient.get(`/stream/chapter/${chapterId}/pages`),

  // Admin
  adminLogin:      (data: any)              => apiClient.post('/admin/login', data),
  adminDashboard:  ()                       => apiClient.get('/admin/dashboard'),
  adminUsers:      (params?: any)           => apiClient.get('/admin/users', { params }),
  adminDeleteUser: (id: string)             => apiClient.delete(`/admin/users/${id}`),
  adminGetUserDevices:(id: string)          => apiClient.get(`/admin/users/${id}/devices`),
  adminBlockDevice: (deviceId: string)      => apiClient.patch(`/admin/users/devices/${deviceId}/block`),
  adminUnblockDevice: (deviceId: string)    => apiClient.patch(`/admin/users/devices/${deviceId}/unblock`),
  blockUser:       (id: string)             => apiClient.patch(`/admin/users/${id}/block`),
  unblockUser:     (id: string)             => apiClient.patch(`/admin/users/${id}/unblock`),
  forceLogout:     (id: string)             => apiClient.patch(`/admin/users/${id}/force-logout`),
  adminUpdateProfile: (data: any)           => apiClient.patch('/admin/profile', data),
  adminOrders:     (params?: any)           => apiClient.get('/orders/admin', { params }),
  verifyOrder:     (id: string)             => apiClient.patch(`/orders/admin/${id}/verify`),
  rejectOrder:     (id: string, reason?: string) => apiClient.patch(`/orders/admin/${id}/reject`, { reason }),
  getProofUrl:     (id: string)             => apiClient.get(`/orders/admin/${id}/proof`),
  grantAccess:     (data: any)              => apiClient.post('/admin/access/grant', data),
  revokeAccess:    (data: any)              => apiClient.post('/admin/access/revoke', data),
  adminContent:    (params?: any)           => apiClient.get('/content', { params }),
  adminAccessGrants:(params?: any)           => apiClient.get('/admin/access-grants', { params }),
  createContent:   (data: any)             => apiClient.post('/content/admin', data),
  updateContent:   (id: string, data: any) => apiClient.patch(`/content/admin/${id}`, data),
  deleteContent:   (id: string)            => apiClient.delete(`/content/admin/${id}`),
  addLesson:       (id: string, data: any) => apiClient.post(`/content/admin/${id}/lessons`, data),
  updateLesson:    (lessonId: string, data: any) => apiClient.patch(`/content/admin/lessons/${lessonId}`, data),
  deleteLesson:    (lessonId: string)      => apiClient.delete(`/content/admin/lessons/${lessonId}`),
  addChapter:      (id: string, data: any) => apiClient.post(`/content/admin/${id}/chapters`, data),
  updateChapter:   (chapterId: string, data: any) => apiClient.patch(`/content/admin/chapters/${chapterId}`, data),
  deleteChapter:   (chapterId: string)     => apiClient.delete(`/content/admin/chapters/${chapterId}`),

  // Admin — affiliate
  createAffiliateOffer: (data: any)             => apiClient.post('/admin/affiliate', data),
  updateAffiliateOffer: (id: string, data: any) => apiClient.patch(`/admin/affiliate/${id}`, data),
  deleteAffiliateOffer: (id: string)            => apiClient.delete(`/admin/affiliate/${id}`),
};

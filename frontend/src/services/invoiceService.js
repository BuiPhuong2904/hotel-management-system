import apiClient from './apiClient';

const invoiceService = {
  getInvoices: async (params = {}) => (await apiClient.get('/invoices', { params })).data,
  getMyInvoices: async () => (await apiClient.get('/invoices/my')).data,
  getInvoiceById: async (id) => (await apiClient.get(`/invoices/${id}`)).data,
  previewInvoice: async (bookingId) =>
    (await apiClient.get('/invoices/preview', { params: { bookingId } })).data,

  createInvoice: async (payload) => (await apiClient.post('/invoices', payload)).data,

  downloadPdf: async (id) =>
    (await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' })).data,
  sendEmail: async (id, email) =>
    (await apiClient.post(`/invoices/${id}/email`, email ? { email } : {})).data,
};

export default invoiceService;
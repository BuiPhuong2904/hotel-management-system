
import apiClient from './apiClient';

// Lấy danh sách dịch vụ
export const getServicesAPI = async (search = '') => {
    try {
        const response = await apiClient.get('/services', {
            params: search ? { search } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy danh sách dịch vụ:', error);
        throw error;
    }
};

// Lấy chi tiết một dịch vụ
export const getServiceByIdAPI = async (serviceId) => {
    try {
        const response = await apiClient.get(`/services/${serviceId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy chi tiết dịch vụ:', error);
        throw error;
    }
};

// Thêm dịch vụ
export const createServiceAPI = async (data) => {
    try {
        const response = await apiClient.post('/services', {
            ServiceName: data.ServiceName,
            Unit: data.Unit,
            Price: Number(data.Price),
            Note: data.Note || null
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi thêm dịch vụ:', error);
        throw error;
    }
};

// Cập nhật dịch vụ
export const updateServiceAPI = async (serviceId, data) => {
    try {
        const response = await apiClient.put(`/services/${serviceId}`, {
            ServiceName: data.ServiceName,
            Unit: data.Unit,
            Price: Number(data.Price),
            Note: data.Note || null
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật dịch vụ:', error);
        throw error;
    }
};

// Xóa dịch vụ
export const deleteServiceAPI = async (serviceId) => {
    try {
        const response = await apiClient.delete(`/services/${serviceId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xóa dịch vụ:', error);
        throw error;
    }
};


import apiClient from './apiClient';

// Lấy toàn bộ lượt sử dụng dịch vụ
export const getAllServiceUsagesAPI = async () => {
    try {
        const response = await apiClient.get('/service-usages/all');
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy danh sách dịch vụ sử dụng:', error);
        throw error;
    }
};

// Lấy danh sách phòng đang có khách
export const getActiveRoomsAPI = async () => {
    try {
        const response = await apiClient.get('/service-usages/active-rooms');
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy danh sách phòng đang có khách:', error);
        throw error;
    }
};

// Lấy dịch vụ sử dụng theo phòng
export const getServiceUsagesByRoomAPI = async (roomId) => {
    try {
        const response = await apiClient.get('/service-usages', {
            params: { roomId }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy dịch vụ theo phòng:', error);
        throw error;
    }
};

// Lấy dịch vụ sử dụng theo đơn đặt phòng
export const getServiceUsagesByBookingAPI = async (bookingId) => {
    try {
        const response = await apiClient.get('/service-usages', {
            params: { bookingId }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy dịch vụ theo đơn đặt phòng:', error);
        throw error;
    }
};

// Ghi nhận một dịch vụ
export const createServiceUsageAPI = async (data) => {
    try {
        const response = await apiClient.post('/service-usages', {
            RoomID: Number(data.RoomID),
            ServiceID: Number(data.ServiceID),
            Quantity: Number(data.Quantity)
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi ghi nhận dịch vụ:', error);
        throw error;
    }
};

// Cập nhật số lượng dịch vụ
export const updateServiceUsageAPI = async (usageId, quantity) => {
    try {
        const response = await apiClient.patch(
            `/service-usages/${usageId}`,
            { Quantity: Number(quantity) }
        );
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật dịch vụ:', error);
        throw error;
    }
};

// Xóa lượt sử dụng dịch vụ
export const deleteServiceUsageAPI = async (usageId) => {
    try {
        const response = await apiClient.delete(`/service-usages/${usageId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi xóa dịch vụ:', error);
        throw error;
    }
};

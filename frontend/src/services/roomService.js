import apiClient from './apiClient';

export const getRoomsAPI = async () => {
    try {
        const response = await apiClient.get('/rooms');
        return response.data; 
    } catch (error) {
        throw error;
    }
};
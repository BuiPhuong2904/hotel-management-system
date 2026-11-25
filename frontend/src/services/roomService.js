import apiClient from './apiClient.js';

const writeConfig = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem('roomToken') || ''}` },
});

export async function getRoomsAPI(params = {}) {
  return (await apiClient.get('/rooms', { params })).data;
}

export async function getRoomAPI(id) {
  return (await apiClient.get(`/rooms/${id}`)).data;
}

export async function getRoomTypesAPI() {
  return (await apiClient.get('/room-types')).data;
}

export async function createRoomAPI(room) {
  return (await apiClient.post('/rooms', room, writeConfig())).data;
}

export async function updateRoomAPI(id, room) {
  return (await apiClient.put(`/rooms/${id}`, room, writeConfig())).data;
}

export async function updateRoomStatusAPI(id, status) {
  return (await apiClient.patch(`/rooms/${id}/status`, { status }, writeConfig())).data;
}

export async function deleteRoomAPI(id) {
  return (await apiClient.delete(`/rooms/${id}`, writeConfig())).data;
}

import apiClient from './apiClient';

const authService = {
  login: async (username, password) =>
    (await apiClient.post('/auth/login', { Username: username, Password: password })).data,
};

export default authService;
import axios from 'axios';
import {CurrentUser} from './CurrentUser';
import {SnackReporter} from './snack/SnackManager';

export const initAxios = (currentUser: CurrentUser, snack: SnackReporter) => {
    axios.interceptors.request.use((config) => {
        config.headers['X-Gotify-Key'] = currentUser.token();
        return config;
    });

    axios.interceptors.response.use(undefined, (error) => {
        if (!error.response) {
            snack('无法访问Gotify服务器 请尝试刷新页面');
            return Promise.reject(error);
        }

        const status = error.response.status;

        if (status === 401) {
            currentUser.tryAuthenticate().then(() => snack('无法完成请求'));
        }

        if (status === 400 || status === 403 || status === 500) {
            snack(error.response.data.error + ': ' + error.response.data.errorDescription);
        }

        return Promise.reject(error);
    });
};

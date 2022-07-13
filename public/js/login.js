/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: { email, password }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            document.cookie = `token=${res.data.token}`;
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

export const logout = () => {
    document.cookie = `token=`;
    window.setTimeout(() => {
        location.reload(true);
    }, 1500);
};


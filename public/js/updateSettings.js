import axios from "axios";
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
    try {
     
        const res = await axios({
            method: 'patch',
            url: `http://localhost:3000/api/v1/users/${type === 'password' ? 'update-password' : 'update-me'}`,
           data,
            headers: {
                // "Content-Type": "multipart/form-data",
                Authorization: 'Bearer ' + document.cookie.split('token=')[1]
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
            if (res.data.token) document.cookie = `token=${res.data.token}`;
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};
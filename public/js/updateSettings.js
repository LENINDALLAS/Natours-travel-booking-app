import axios from "axios";
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
try {
   // console.log(email, name)
   // console.log(document.cookie.split('=')[1])
    // axios.defaults.withCredentials = true
    const res = await axios({
        method: 'PATCH',
        url: `http://localhost:3000/api/v1/users/${type === 'password' ? 'update-password' : 'update-me'}`,
        data,
        headers: {
            Authorization: 'Bearer ' + document.cookie.split('=')[1]
        }
    });
    if(res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()} updated successfully`);
       if(res.data.token) document.cookie = `token=${res.data.token}`;
    }
} catch(error) {
    showAlert('error', error.response.data.message);
} 
};
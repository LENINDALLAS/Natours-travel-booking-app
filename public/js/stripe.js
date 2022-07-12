/* eslint-disable  */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51LJyARSITRzDtMl6QQJBCMC9NerajqjgOMZyrFtYLYYwYKzK7V2fwGhrHIlLtm6cNDL3zffnjDCvMAo2I1Gm9koK00y8RU0Scu');

export const bookTour = async (tourId ) => {
    try {
        const session = await axios({
            method: 'GET',
            url: `http://localhost:3000/api/v1/bookings/${tourId}`,
            headers: {
                // "Content-Type": "multipart/form-data",
                Authorization: 'Bearer ' + document.cookie.split('token=')[1]
            }
        });

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (error) {
        showAlert('error' , error)
    }
    
};
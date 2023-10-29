import axios from 'axios';

const API_KEY = 'AIzaSyCpAI_hK9-oI8un26h1IDraWN1LVuUyy8M';

export async function geocodeAddress(address) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
}
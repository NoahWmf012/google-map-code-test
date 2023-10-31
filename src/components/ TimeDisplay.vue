<template>
    <div class="position-relative">
        <div class="position-absolute top-0 end-0 bg-dark bg-gradient text-white bg-opacity-50 p-2">
            <h2 v-if="loading">Loading...</h2>
            <h2 v-else-if="error">{{ error }}</h2>
            <div v-else>
                <h6>Timezone: {{ timezone }}</h6>
                <h6>Local Time: {{ localTime }}</h6>
            </div>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
const API_KEY = 'AIzaSyCpAI_hK9-oI8un26h1IDraWN1LVuUyy8M'
export default {
    name: "TimeDisplay",
    props: {
        place: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            loading: false,
            error: '',
            timezone: '',
            localTime: ''
        };
    },
    watch: {
        place() {
            this.getTimezone();
        }
    },
    mounted() {
        this.getTimezone()
    },
    methods: {
        getTimezone() {
            this.loading = true;
            this.error = '';
            axios
                .get(`https://maps.googleapis.com/maps/api/timezone/json?location=${this.place.lat}%2C${this.place.lng}&timestamp=1331161200&key=${API_KEY}`)
                .then(response => {
                    this.timezone = response.data.timeZoneName + ` UTC(${response.data.rawOffset > 0 ? "+" + response.data.rawOffset / 3600 : response.data.rawOffset / 3600})`;
                    const timeStamp = Date.now() + response.data.rawOffset * 1000
                    this.localTime = new Date(timeStamp).toUTCString();
                    this.loading = false;
                })
                .catch(error => {
                    this.error = 'Error retrieving timezone information.' + error;
                    this.loading = false;
                });
        }
    }
};
</script>
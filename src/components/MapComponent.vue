<template>
    <button class="btn btn-primary" @click="fetchCurrentLocation">Let's start</button>
    <div v-if="showMap">
        <!-- search bar -->
        <div style="position:relative;z-index:1">
            <input type="text" v-model="address" />
            <button @click="geocode">Geocode</button>
            <div v-if="geocodingResult">
                Latitude: {{ geocodingResult.results[0].geometry.location.lat }}
                Longitude: {{ geocodingResult.results[0].geometry.location.lng }}
            </div>
        </div>

        <!-- pagination -->

        <!-- google map -->
        <section id="map" ref="map"></section>
    </div>
</template>
<script>
import { geocodeAddress } from '../services/geocodingService';

export default {
    name: "MapComponent",
    data() {
        return {
            address: '',
            geocodingResult: null,
            showMap: false,
        };
    },
    methods: {
        async geocode() {
            try {
                this.geocodingResult = await geocodeAddress(this.address);
                const { lat, lng } = this.geocodingResult.results[0].geometry.location
                this.fetchLocation(lat, lng)
            } catch (error) {
                alert(error)
            }
        },
        fetchCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.fetchLocation(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                    }
                )
                this.showMap = true
            } else {
                console.log("Your browser does not allow to  geolocation API ");
            }
        },
        fetchLocation(latitude, longitude) {
            // Show & center the Map based oon
            var map = new window.google.maps.Map(this.$refs["map"], {
                zoom: 15,
                center: new window.google.maps.LatLng(latitude, longitude),
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            });

            new window.google.maps.Marker({
                position: new window.google.maps.LatLng(latitude, longitude),
                map: map,
            });
        },
    },
}
</script>
<style>
#map {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: brown;
}
</style>
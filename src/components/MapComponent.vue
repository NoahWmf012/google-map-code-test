<template>
    <button class="btn btn-primary" @click="fetchCurrentLocation">Let's start</button>
    <div v-if="showMap">
        <!-- search bar -->
        <div id="search-bar" style="position:relative;z-index:1">
            <input type="text" placeholder="Enter your address" @keyup.enter="geocode" v-model="address"
                ref="autocomplete" />
            <button class="btn btn-primary" @click="geocode">GO</button>
            <button class="btn btn-info" :disabled="records.length === 0" @click="showTable = !showTable">
                {{ showTable ? "Hide Records" : "Show Records" }}
            </button>
        </div>

        <!-- data table -->
        <div id="data-table" style="position:relative;z-index:1" v-if="showTable">
            <p>{{ markers }}</p>
            <table class="table">
                <tbody>
                    <tr v-for="(record, index) in filteredRecords" :key="index">
                        <input v-model="markers" type="checkbox" :id="record.name" :value="record" />
                        <th scope="row">{{ (currentPage - 1) * rowsPerPage + index + 1 }}</th>
                        <td>{{ record.name }}</td>
                    </tr>
                </tbody>
            </table>
            <nav aria-label="Page navigation example">
                <ul class="pagination">
                    <li class="page-item">
                        <a class="page-link" @click="previousPage" :disabled="currentPage === 1">Previous</a>
                    </li>
                    <li v-for="index in totalPages" :key="index" class="page-item">
                        <a class="page-link" @click="goToPage(index)">{{ index }}</a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" @click="nextPage" :disabled="currentPage === totalPages">Next</a>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- google map -->
        <section id="map" ref="map"></section>
    </div>
</template>
  
<script>
import { geocodeAddress } from '../services/geocodingService';
import { toRaw } from 'vue';

export default {
    name: "MapComponent",
    data() {
        return {
            address: '',
            geocodingResult: null,
            showMap: false,
            records: [],
            markers: [],
            showTable: false,
            currentPage: 1,
            totalPages: 1,
            rowsPerPage: 10,
            map: { location: "" }
        };
    },
    methods: {
        async geocode() {
            try {
                this.geocodingResult = await geocodeAddress(this.address);
                const { lat, lng } = this.geocodingResult.results[0].geometry.location;
                this.fetchLocation(lat, lng, this.geocodingResult.results[0].formatted_address);
            } catch (error) {
                alert(error);
            }
        },
        fetchCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    this.fetchLocation(position.coords.latitude, position.coords.longitude);
                });
                this.showMap = true;
            } else {
                console.log("Your browser does not allow geolocation API.");
            }
        },
        fetchLocation(latitude, longitude, name = "") {
            // Show & center the Map based on latitude and longitude
            var map = new window.google.maps.Map(this.$refs["map"], {
                zoom: 15,
                center: new window.google.maps.LatLng(latitude, longitude),
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            });
            new window.google.maps.Marker({
                position: new window.google.maps.LatLng(latitude, longitude),
                map: map,
            });

            if (name !== undefined && name.length > 0) {
                this.records.unshift({ name, latitude, longitude });
            }
            // Update the total pages based on the number of records
            this.totalPages = Math.ceil(this.records.length / this.rowsPerPage);
            this.map = map
        },

        // Pagination methods
        previousPage() {
            this.currentPage--;
        },
        nextPage() {
            this.currentPage++;
        },
        goToPage(pageNum) {
            this.currentPage = pageNum;
        }
    },
    watch: {
        markers(newValue, oldValue) {
            console.log(">>>", newValue, oldValue)
            const _map = toRaw(this.map)
            const _newValue = toRaw(newValue)
            for (var location in _newValue) {
                new window.google.maps.Marker({
                    position: new window.google.maps.LatLng(_newValue[location].latitude, _newValue[location].longitude),
                    map: _map,
                });
            }
        }
    },
    computed: {
        filteredRecords() {
            const startIndex = (this.currentPage - 1) * this.rowsPerPage;
            const endIndex = startIndex + this.rowsPerPage;
            return this.records.slice(startIndex, endIndex);
        }
    },
};
</script>
  
<style>
#map {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: grey;
}
</style>
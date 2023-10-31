<template>
    <button v-if="!showMap" class="btn btn-primary" @click="fetchCurrentLocation">Let's start</button>
    <div v-if="showMap">
        <!-- search bar -->
        <div id="search-bar" class="position-absolute top-0 start-50 translate-middle-x" style="z-index:1">
            <div class="input-group mb-3">
                <input class="form-control" type="text" placeholder="Enter your address" @keyup.enter="geocode"
                    v-model="address" ref="autocomplete" />
                <button class="btn btn-primary" @click="geocode">GO</button>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"
                    :disabled="records.length === 0" @click="showTable = !showTable">
                    Show Records
                </button>
            </div>
        </div>

        <!-- Date Time -->
        <TimeDisplay v-if="place" :place="place" style="z-index:1" />

        <!-- data table -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">Records</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="data-table" class="table position-relative" style="z-index:1">
                            <table class="w-100">
                                <tbody>
                                    <tr v-for="( record, index ) in  filteredRecords " :key="index">
                                        <input v-model="selectedData" type="checkbox" :id="record.name" :value="record" />
                                        <th scope="row">{{ (currentPage - 1) * rowsPerPage + index + 1 }}</th>
                                        <td>{{ record.name }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="position-relative">
                                <nav aria-label="Page navigation">
                                    <ul class="pagination">
                                        <li class="page-item p-0">
                                            <button class="page-link" @click="previousPage"
                                                :disabled="currentPage == 1">Previous</button>
                                        </li>
                                        <li v-for=" index  in  totalPages " :key="index" class="page-item p-0">
                                            <button class="page-link" @click="goToPage(index)">{{ index }}</button>
                                        </li>
                                        <li class="page-item p-0">
                                            <button class="page-link" @click="nextPage"
                                                :disabled="currentPage == totalPages">Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" :disabled="selectedData.length === 0"
                            @click="removeData()">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- google map -->
        <section id="map" ref="map" style="z-index:-1"></section>
    </div>
</template>
  
<script>
import { geocodeAddress } from '../services/geocodingService';
import { toRaw } from 'vue'; //extract target from proxy object
import TimeDisplay from './ TimeDisplay.vue';

export default {
    name: "MapComponent",
    components: { TimeDisplay },
    data() {
        return {
            address: '',
            geocodingResult: null,
            showMap: false,
            records: [],
            selectedData: [],
            makers: [],
            showTable: false,
            currentPage: 1,
            totalPages: 1,
            rowsPerPage: 10,
            map: "",
            place: null,
        };
    },
    methods: {
        //Google Map API
        async geocode() {
            try {
                this.geocodingResult = await geocodeAddress(this.address);
                const { lat, lng } = this.geocodingResult.results[0].geometry.location;
                this.place = { lat, lng }
                this.fetchLocation(lat, lng, this.geocodingResult.results[0].formatted_address);
            } catch (error) {
                alert(error);
            }
        },
        fetchCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    // console.log("position: ", position)
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude
                    this.place = { lat, lng }
                    this.fetchLocation(lat, lng);
                });
                this.showMap = true;
            } else {
                console.log("Your browser does not allow geolocation API.");
            }
        },
        fetchLocation(latitude, longitude, name = "") {
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
            this.totalPages = Math.ceil(this.records.length / this.rowsPerPage);
            this.map = map
        },

        //remove data and markers
        removeData() {
            const names = new Set(this.selectedData.map(obj => obj.name))

            for (let i = this.records.length - 1; i >= 0; i--) {
                if (names.has(this.records[i].name)) {
                    const _r = this.records.map((record) => toRaw(record))
                    _r.splice(i, 1)
                    this.records = _r;
                    this.selectedData = [];
                }
            }
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
        },
    },
    watch: {
        //add new marker whenever a data is selected
        selectedData(newValue, oldValue) {
            console.log(newValue, oldValue)
            const _map = toRaw(this.map)
            const _newValue = toRaw(newValue)
            this.makers.map((m) => toRaw(m).setMap(null))
            for (var location in _newValue) {
                const _m = new window.google.maps.Marker({
                    position: new window.google.maps.LatLng(_newValue[location].latitude, _newValue[location].longitude),
                    map: _map,
                });
                this.makers.push(_m)
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
/// <reference types="@types/googlemaps" />
import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
declare const google:any;
import {GoogleMapModel, Coords} from './google-map.interface';
import {GOOGLE_MAP_LIB_URL} from './google-map-defines';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html'
})

export class GoogleMapComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  @Input() public mapOptions: GoogleMapModel;
  @Output() public onMapDataCalculated = new EventEmitter<{distance: string, distanceInMeters: number, arrivalTime: any, remainingTime: string}>();
  @Output() public onMapLoaded = new EventEmitter<any>();
  map: any;
  markers = [];
  distance;
  remainingTime;
  remainingTimeInMillisecons;
  arrivalTime;
  markersCoords: Coords[] = [];
  mapLoaded:boolean = true;
  constructor() {}
  ngOnInit () {
    if (this.mapOptions) {
      this.loadExternalScript(GOOGLE_MAP_LIB_URL).then(()=>{
        this.mapLoaded = true;
        this.onMapLoaded.emit({
          mapLoaded: this.mapLoaded
        })
         /** get center Coord  */
        if (this.mapOptions.srcGpsCoordinate.lat && this.mapOptions.srcGpsCoordinate.lng) {
          this.markers = [
           new google.maps.Marker({
              position: new google.maps.LatLng(this.mapOptions.srcGpsCoordinate.lat, this.mapOptions.srcGpsCoordinate.lng),
              map: this.map,
              icon: this.mapOptions.srcGpsCoordinate.icon,
            }),
          ];
        };
        /** get targetAddressCoord  */
        if (this.mapOptions.targetGpsCoordinate.lat && this.mapOptions.targetGpsCoordinate.lng) {
          this.markers.push(new google.maps.Marker({
            position: new google.maps.LatLng(this.mapOptions.targetGpsCoordinate.lat, this.mapOptions.targetGpsCoordinate.lng),
            map: this.map,
            icon: this.mapOptions.targetGpsCoordinate.icon,
          }))
        };
        /** init map props */
        const mapProperties = {
          center: new google.maps.LatLng(this.mapOptions.srcGpsCoordinate.lat, this.mapOptions.srcGpsCoordinate.lng),
          zoom: this.mapOptions.zoom,
          mapTypeId: this.mapOptions.mapTypeId,
      };

      this.mapInitializer (mapProperties);
      }).catch((err)=>{
        /** emit event on script failure to handle it */
        this.mapLoaded = false;
        this.onMapLoaded.emit({
          mapScriptError: err,
          mapLoaded: this.mapLoaded
        })
      });
    }
  };

    /** loadExternalScript */
    public loadExternalScript ( scriptUrl: string ) {
      return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.onload = () => {
          resolve({script: scriptUrl, loaded: true, status: 'Loaded'});
      };
        scriptElement.onerror = (error: any) => resolve({script: scriptUrl, loaded: false, status: 'Loaded'});
        document.body.appendChild(scriptElement);
      });
    }

    /** mapInitializer */
    mapInitializer ( mapProperties: GoogleMapModel ) {
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProperties);
      /** bounds to centre zoom and fitBounds markers dynamically */
      let bounds = new google.maps.LatLngBounds();
      if (this.markers && this.markers.length > 0) {
        this.markers.forEach((marker) => {
          this.markersCoords.push(marker.position);
          marker.setMap(this.map);
          bounds.extend(marker.position);
        });
        /** set center between more than marker */
        this.map.fitBounds(bounds);
      };
      const distanceService = new google.maps.DistanceMatrixService();
      if (this.mapOptions.srcGpsCoordinate.lat && this.mapOptions.targetGpsCoordinate.lat){
        this.calculateDistaneAndTime(distanceService);
      }
    };
  /** calculateDistaneAndTime using distance matrix  */
  calculateDistaneAndTime(matrixDirection) {
    /** create distance matrix request */
    const request = {
      origins: [this.mapOptions.srcGpsCoordinate],
      destinations: [this.mapOptions.targetGpsCoordinate],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };
    /** get distance & remaining time from matrix api response
     * then calculate arrival time
     */
    matrixDirection.getDistanceMatrix(request).then((response) => {
        this.distance = response.rows[0].elements[0].distance.text;
        const distanceInMeters = response.rows[0].elements[0].distance.value;
        this.remainingTime = response.rows[0].elements[0].duration.text;
        this.remainingTimeInMillisecons = response.rows[0].elements[0].duration.value;
        let totalTimeInMillSeconds = new Date (this.mapOptions.gpsTimestamp).getTime() + this.remainingTimeInMillisecons * 1000;
        this.arrivalTime = new Date(totalTimeInMillSeconds).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        /** emit event values to parent component */
        this.onMapDataCalculated.emit({
          distance: this.distance,
          distanceInMeters: distanceInMeters,
          arrivalTime: this.arrivalTime,
          remainingTime: this.remainingTime
        });
    })
    .catch((err)=> {
      /** emit event on distance matrix failure to handle it */
      this.mapLoaded = false;
      this.onMapLoaded.emit({
        distanceError: err,
        mapLoaded: this.mapLoaded
      })
    });
  };

}

/** GoogleMap */
export interface GoogleMapModel {
   /**  center */
   center: Coords;
  /**  srcGpsCoordinate */
  srcGpsCoordinate?: Coords;
  /**  targetAddressCoord */
  targetGpsCoordinate?: Coords;
  /**  zoom level */
  zoom?: number;
  /**  mapTypeId */
  mapTypeId : MapId;
  /** first name */
  firstName?: string;
  /** last Name */
  lastName?: string;
  /**  gpsTimeStamp */
  gpsTimestamp?: string;
}

 /** mapTypeId enum */
export enum MapId {
   ROADMAP = "roadmap",
   SATELLITE = "satellite",
   HAYBRID = "hybrid",
   TERRAIN = "terrain",
};
/** coords */
export interface Coords {
  /** lat */
  lat: number;
  /** lng */
  lng: number;
  /** icon */
  icon?: string;
};

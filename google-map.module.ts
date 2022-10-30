import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent } from './google-map.component';


/** NgModule */
@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [],
  declarations: [GoogleMapComponent],
  exports: [GoogleMapComponent],
})
export class GoogleMapModule { }

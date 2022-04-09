import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PanelMenuModule} from 'primeng/panelmenu';
import {SliderModule} from 'primeng/slider';
import {FormsModule} from "@angular/forms";
import {ButtonModule} from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import {DialogModule} from 'primeng/dialog';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    PanelMenuModule,
    SliderModule,
    FormsModule,
    ButtonModule,
    NgChartsModule,
    DialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Overlay from 'ol/Overlay';
import VectorLayer from "ol/layer/Vector";
import { WindLayer } from 'ol-wind';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as ol_get, Projection} from 'ol/proj';
import Image from 'ol/layer/Image'
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import XYZ from "ol/source/XYZ";
import OSM from 'ol/source/OSM';
import * as Proj from 'ol/proj';
import IDW from 'ol-ext/source/IDW';
import { PrimeNGConfig } from 'primeng/api';
import * as moment from 'moment';
import {transform} from 'ol/proj';

import {MenuItem} from 'primeng/api';
import {MapService} from "./map.service";
import { ChartData, ChartOptions } from 'chart.js';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title:string = 'cempa';
  // dates: string[];
  layersMapserver: string[];
  // selectedDate: string;
  date: number;
  selectedLayerMapserver: string
  isStopped: boolean;

  map: Map | undefined;

  items: MenuItem[];
  layer: TileLayer<any> | undefined;
  image: Image<any> | undefined;
  idw: IDW;
  serie: any[];
  display: boolean = false;
  coordinate: number[] = [];
  
  serieData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Temperaturas do ponto selecionado',
      },
    },
  };

  constructor(
    private primengConfig: PrimeNGConfig,
    private mapService: MapService
  ) {
    // Configurações da projeção utilizada.
    proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
    register(proj4);

    this.date = 0;
    this.serie = [];
    this.items = [
      {label: 'Temperaturas', icon: 'pi pi-fw pi-circle-fill',  command: event => this.changeLayer(3)}
    ];
    this.layersMapserver = [
      "td2mj__2022-04-08T09-00",
      "td2mj__2022-04-08T13-00",
      "td2mj__2022-04-08T23-00",
      "td2mj__2022-04-09T08-00",
      "td2mj__2022-04-09T19-00",
      "td2mj__2022-04-11T02-00",
      "td2mj__2022-04-12T05-00",
      "td2mj__2022-04-12T13-00",
      "td2mj__2022-04-12T15-00",
      "td2mj__2022-04-12T21-00"
    ];

    this.selectedLayerMapserver = this.layersMapserver[0];
    this.isStopped = false;
  
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.layer = new TileLayer({
      opacity: 0.6,
      source: new XYZ({
        urls: [
          `https://o9.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o10.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o11.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o12.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        ]
      })
    });
    let extent = [-55.0000000000000000,-21.0000000000000000, -42.9614372253417969,-8.9754829406738299];
    const wordExtent: Array<number> = [-122.19, -59.87, -25.28, 32.72];
    ol_get('EPSG:4674').setExtent(extent);
    ol_get('EPSG:4674').setWorldExtent(wordExtent);

    const projection = new Projection({
      code: 'EPSG:4674',
      units: 'm',
      extent: extent,
      worldExtent: wordExtent
    });

    this.map = new Map({
      view: new View({
        center: Proj.fromLonLat([-49.624, -16.042], 'EPSG:4674'),
        zoom: 1,
        extent: extent,
        projection: projection
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.layer,
        new TileLayer({
          
          opacity: 0.7,
          source: new XYZ({
            urls: [
              `https://o1.lapig.iesa.ufg.br/ows?layers=municipios_goias&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
              `https://o2.lapig.iesa.ufg.br/ows?layers=municipios_goias&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
              `https://o3.lapig.iesa.ufg.br/ows?layers=municipios_goias&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
              `https://o4.lapig.iesa.ufg.br/ows?layers=municipios_goias&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
            ]
          })
        })
      ],
      target: 'ol-map'
    });


    const self = this;
    this.map.on('singleclick', function (evt) {
      let coordinate = evt.coordinate;
      coordinate = Proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      self.serie = [];  
      self.serieData.labels = [];
      self.serieData.datasets = [];
      self.display = false;  
      self.coordinate = []; 
      self.mapService.getSerie(coordinate).subscribe(result => {
        self.coordinate = coordinate; 
        self.serie = result.data;
        self.serieData.labels = result.data.map(dt => moment(dt.datetime).format('DD/MM/YYYY HH:mm:ss'))
        self.serieData.datasets = [
          { label: 'Temperaturas em ºC', data: result.data.map(dt => dt.value.toFixed(1)), tension: 0.5 }
        ]
        self.display = true;;
      }, () =>{
        self.display = false;
      })
    });

    // this.mapService.getWinds().subscribe(res => {
    //   // const windLayer = new WindLayer(res,{
    //   //   windOptions: {
    //   //     // colorScale: (m) => {
    //   //     //   // console.log(m);
    //   //     //   return '#fff';
    //   //     // },
    //   //     colorScale: [
    //   //       "rgb(36,104, 180)",
    //   //       "rgb(60,157, 194)",
    //   //       "rgb(128,205,193 )",
    //   //       "rgb(151,218,168 )",
    //   //       "rgb(198,231,181)",
    //   //       "rgb(238,247,217)",
    //   //       "rgb(255,238,159)",
    //   //       "rgb(252,217,125)",
    //   //       "rgb(255,182,100)",
    //   //       "rgb(252,150,75)",
    //   //       "rgb(250,112,52)",
    //   //       "rgb(245,64,32)",
    //   //       "rgb(237,45,28)",
    //   //       "rgb(220,24,32)",
    //   //       "rgb(180,0,35)"
    //   //     ],
    //   //     // velocityScale: 1 / 20,
    //   //     // paths: 5000,
    //   //     frameRate: 16,
    //   //     maxAge: 60,
    //   //     globalAlpha: 0.9,
    //   //     velocityScale: 1 / 30,
    //   //     // paths: 10000,
    //   //     generateParticleOption: true,
    //   //   },
    //   // });
    //   //
    //   // this.map?.addLayer(windLayer);
    // })
  }

  changeLayer(layer: number){
    this.selectedLayerMapserver = this.layersMapserver[layer]
    this.layer?.getSource().setUrls(
      [
        `https://o9.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o10.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o11.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o12.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
      ]
    );
   
  }

  onDateChange(ev: any){
    this.selectedLayerMapserver = this.layersMapserver[ev.value];
    this.layer?.getSource().setUrls(
      [
        `https://o9.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o10.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o11.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        `https://o12.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
      ]
    );
  }

  setGeojson(){
    this.mapService.getGeojson(this.selectedLayerMapserver).subscribe(result => {
      let features = (new GeoJSON()).readFeatures(result, {
        dataProjection: 'EPSG:4674',
        featureProjection: 'EPSG:3857'
      });
      const columnData = this.selectedLayerMapserver  === 'albedts' ? 'albedt' : 'tempc'
      this.idw = new IDW( {
        source: new VectorSource({ features }),
        weight: (feat) =>{
          let data = feat.get(columnData);
          console.log(data)
          return parseFloat(data)
        }
      });
      console.log(this.idw)
      this.image = new Image({
        source: this.idw,
        opacity: .5
      });

      this.map?.addLayer(this.image);
    })

  }

  play(){
    this.isStopped = false;
    setInterval(() => {
      if(!this.isStopped){
        if(this.date == this.layersMapserver.length -1){
          this.date =  0
        } else {
          this.date++;
        }
        this.onDateChange({value: this.date})
      }
    }, 1000);
  }

  stop(){
    this.isStopped = true;
  }

  formatDate(date): string {
    let string = ''; 
    date = date.replace('td2mj__', '').split("T");
    let dt = date[0]
    let time = date[1].replace('-', ':')  
    return dt + ' ' + time;
  }

}

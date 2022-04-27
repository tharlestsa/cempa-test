import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import BaseObject from 'ol/Object';
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
  layer: Array<TileLayer<any>> | undefined;
  image: Image<any> | undefined;
  idw: IDW;
  serie: any[];
  display: boolean = false;
  coordinate: number[] = [];
  opacity: number = 0.6;
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
      't2mj__2022-04-12T00-00',
      't2mj__2022-04-12T01-00',
      't2mj__2022-04-12T02-00',
      't2mj__2022-04-12T03-00',
      't2mj__2022-04-12T04-00',
      't2mj__2022-04-12T05-00',
      't2mj__2022-04-12T06-00',
      't2mj__2022-04-12T07-00',
      't2mj__2022-04-12T08-00',
      't2mj__2022-04-12T09-00',
      't2mj__2022-04-12T10-00',
      't2mj__2022-04-12T11-00',
      't2mj__2022-04-12T12-00',
      't2mj__2022-04-12T13-00',
      't2mj__2022-04-12T14-00',
      't2mj__2022-04-12T15-00',
      't2mj__2022-04-12T16-00',
      't2mj__2022-04-12T17-00',
      't2mj__2022-04-12T18-00',
      't2mj__2022-04-12T19-00',
      't2mj__2022-04-12T20-00',
      't2mj__2022-04-12T21-00',
      't2mj__2022-04-12T22-00',
      't2mj__2022-04-12T23-00',
      't2mj__2022-04-13T00-00',
      't2mj__2022-04-13T01-00',
      't2mj__2022-04-13T02-00',
      't2mj__2022-04-13T03-00',
      't2mj__2022-04-13T04-00',
      't2mj__2022-04-13T05-00',
      't2mj__2022-04-13T06-00',
      't2mj__2022-04-13T07-00',
      't2mj__2022-04-13T08-00',
      't2mj__2022-04-13T09-00',
      't2mj__2022-04-13T10-00',
      't2mj__2022-04-13T11-00',
      't2mj__2022-04-13T12-00',
      't2mj__2022-04-13T13-00',
      't2mj__2022-04-13T14-00',
      't2mj__2022-04-13T15-00',
      't2mj__2022-04-13T16-00',
      't2mj__2022-04-13T17-00',
      't2mj__2022-04-13T18-00',
      't2mj__2022-04-13T19-00',
      't2mj__2022-04-13T20-00',
      't2mj__2022-04-13T21-00',
      't2mj__2022-04-13T22-00',
      't2mj__2022-04-13T23-00',
      't2mj__2022-04-14T00-00',
      't2mj__2022-04-14T01-00',
      't2mj__2022-04-14T02-00',
      't2mj__2022-04-14T03-00',
      't2mj__2022-04-14T04-00',
      't2mj__2022-04-14T05-00',
      't2mj__2022-04-14T06-00',
      't2mj__2022-04-14T07-00',
      't2mj__2022-04-14T08-00',
      't2mj__2022-04-14T09-00',
      't2mj__2022-04-14T10-00',
      't2mj__2022-04-14T11-00',
      't2mj__2022-04-14T12-00',
      't2mj__2022-04-14T13-00',
      't2mj__2022-04-14T14-00',
      't2mj__2022-04-14T15-00',
      't2mj__2022-04-14T16-00',
      't2mj__2022-04-14T17-00',
      't2mj__2022-04-14T18-00',
      't2mj__2022-04-14T19-00',
      't2mj__2022-04-14T20-00',
      't2mj__2022-04-14T21-00',
      't2mj__2022-04-14T22-00',
      't2mj__2022-04-14T23-00',
      't2mj__2022-04-15T00-00',
      't2mj__2022-04-15T01-00',
      't2mj__2022-04-15T02-00',
      't2mj__2022-04-15T03-00',
      't2mj__2022-04-15T04-00',
      't2mj__2022-04-15T05-00',
      't2mj__2022-04-15T06-00',
      't2mj__2022-04-15T07-00',
      't2mj__2022-04-15T08-00',
      't2mj__2022-04-15T09-00',
      't2mj__2022-04-15T10-00',
      't2mj__2022-04-15T11-00',
      't2mj__2022-04-15T12-00',
      't2mj__2022-04-15T13-00',
      't2mj__2022-04-15T14-00',
      't2mj__2022-04-15T15-00',
      't2mj__2022-04-15T16-00',
      't2mj__2022-04-15T17-00',
      't2mj__2022-04-15T18-00',
      't2mj__2022-04-15T19-00',
      't2mj__2022-04-15T20-00',
      't2mj__2022-04-15T21-00',
      't2mj__2022-04-15T22-00',
      't2mj__2022-04-15T23-00',
      't2mj__2022-04-16T00-00',
      't2mj__2022-04-16T01-00',
      't2mj__2022-04-16T02-00',
      't2mj__2022-04-16T03-00',
      't2mj__2022-04-16T04-00',
      't2mj__2022-04-16T05-00',
      't2mj__2022-04-16T06-00',
      't2mj__2022-04-16T07-00',
      't2mj__2022-04-16T08-00',
      't2mj__2022-04-16T09-00',
      't2mj__2022-04-16T10-00',
      't2mj__2022-04-16T11-00',
      't2mj__2022-04-16T12-00',
      't2mj__2022-04-16T13-00',
      't2mj__2022-04-16T14-00',
      't2mj__2022-04-16T15-00',
      't2mj__2022-04-16T16-00',
      't2mj__2022-04-16T17-00',
      't2mj__2022-04-16T18-00',
      't2mj__2022-04-16T19-00',
      't2mj__2022-04-16T20-00',
      't2mj__2022-04-16T21-00',
      't2mj__2022-04-16T22-00',
      't2mj__2022-04-16T23-00',
      't2mj__2022-04-17T00-00',
      't2mj__2022-04-17T01-00',
      't2mj__2022-04-17T02-00',
      't2mj__2022-04-17T03-00',
      't2mj__2022-04-17T04-00',
      't2mj__2022-04-17T05-00',
      't2mj__2022-04-17T06-00',
      't2mj__2022-04-17T07-00',
      't2mj__2022-04-17T08-00',
      't2mj__2022-04-17T09-00',
      't2mj__2022-04-17T10-00',
      't2mj__2022-04-17T11-00',
      't2mj__2022-04-17T12-00',
      't2mj__2022-04-17T13-00',
      't2mj__2022-04-17T14-00',
      't2mj__2022-04-17T15-00',
      't2mj__2022-04-17T16-00',
      't2mj__2022-04-17T17-00',
      't2mj__2022-04-17T18-00',
      't2mj__2022-04-17T19-00',
      't2mj__2022-04-17T20-00',
      't2mj__2022-04-17T21-00',
      't2mj__2022-04-17T22-00',
      't2mj__2022-04-17T23-00',
      't2mj__2022-04-18T00-00',
      't2mj__2022-04-18T01-00',
      't2mj__2022-04-18T02-00',
      't2mj__2022-04-18T03-00',
      't2mj__2022-04-18T04-00',
      't2mj__2022-04-18T05-00',
      't2mj__2022-04-18T06-00',
      't2mj__2022-04-18T07-00',
      't2mj__2022-04-18T08-00',
      't2mj__2022-04-18T09-00',
      't2mj__2022-04-18T10-00',
      't2mj__2022-04-18T11-00',
      't2mj__2022-04-18T12-00',
      't2mj__2022-04-18T13-00',
      't2mj__2022-04-18T14-00',
      't2mj__2022-04-18T15-00',
      't2mj__2022-04-18T16-00',
      't2mj__2022-04-18T17-00',
      't2mj__2022-04-18T18-00',
      't2mj__2022-04-18T19-00',
      't2mj__2022-04-18T20-00',
      't2mj__2022-04-18T21-00',
      't2mj__2022-04-18T22-00',
      't2mj__2022-04-18T23-00',
      't2mj__2022-04-19T00-00',
      't2mj__2022-04-19T01-00',
      't2mj__2022-04-19T02-00',
      't2mj__2022-04-19T03-00',
      't2mj__2022-04-19T04-00',
      't2mj__2022-04-19T05-00',
      't2mj__2022-04-19T06-00',
      't2mj__2022-04-19T07-00',
      't2mj__2022-04-19T08-00',
      't2mj__2022-04-19T09-00',
      't2mj__2022-04-19T10-00',
      't2mj__2022-04-19T11-00',
      't2mj__2022-04-19T12-00',
      't2mj__2022-04-19T13-00',
      't2mj__2022-04-19T14-00',
      't2mj__2022-04-19T15-00',
      't2mj__2022-04-19T16-00',
      't2mj__2022-04-19T17-00',
      't2mj__2022-04-19T18-00',
      't2mj__2022-04-19T19-00',
      't2mj__2022-04-19T20-00',
      't2mj__2022-04-19T21-00',
      't2mj__2022-04-19T22-00',
      't2mj__2022-04-19T23-00',
      't2mj__2022-04-20T00-00',
      't2mj__2022-04-20T01-00',
      't2mj__2022-04-20T02-00',
      't2mj__2022-04-20T03-00',
      't2mj__2022-04-20T04-00',
      't2mj__2022-04-20T05-00',
      't2mj__2022-04-20T06-00',
      't2mj__2022-04-20T07-00',
      't2mj__2022-04-20T08-00',
      't2mj__2022-04-20T09-00',
      't2mj__2022-04-20T10-00',
      't2mj__2022-04-20T11-00',
      't2mj__2022-04-20T12-00',
      't2mj__2022-04-20T13-00',
      't2mj__2022-04-20T14-00',
      't2mj__2022-04-20T15-00',
      't2mj__2022-04-20T16-00',
      't2mj__2022-04-20T17-00',
      't2mj__2022-04-20T18-00',
      't2mj__2022-04-20T19-00',
      't2mj__2022-04-20T20-00',
      't2mj__2022-04-20T21-00',
      't2mj__2022-04-20T22-00',
      't2mj__2022-04-20T23-00',
      't2mj__2022-04-21T00-00',
      't2mj__2022-04-21T01-00',
      't2mj__2022-04-21T02-00',
      't2mj__2022-04-21T03-00',
      't2mj__2022-04-21T04-00',
      't2mj__2022-04-21T05-00',
      't2mj__2022-04-21T06-00',
      't2mj__2022-04-21T07-00',
      't2mj__2022-04-21T08-00',
      't2mj__2022-04-21T09-00',
      't2mj__2022-04-21T10-00',
      't2mj__2022-04-21T11-00',
      't2mj__2022-04-21T12-00',
      't2mj__2022-04-21T13-00',
      't2mj__2022-04-21T14-00',
      't2mj__2022-04-21T15-00',
      't2mj__2022-04-21T16-00',
      't2mj__2022-04-21T17-00',
      't2mj__2022-04-21T18-00',
      't2mj__2022-04-21T19-00',
      't2mj__2022-04-21T20-00',
      't2mj__2022-04-21T21-00',
      't2mj__2022-04-21T22-00',
      't2mj__2022-04-21T23-00',
      't2mj__2022-04-22T00-00'
    ];

    this.selectedLayerMapserver = this.layersMapserver[0];
    this.isStopped = false;

  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;


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
          properties:{
            type:'base'
          },
          source: new OSM(),
        }),

        new TileLayer({
          properties:{
            type:'base'
          },
          opacity: 0.9,
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

    for(let i = 0;i < this.layersMapserver.length;i++ ){
      this.map?.addLayer(this.creatLayer(i))
    }

    const self = this;
    this.map.on('singleclick', function (evt) {
      let coordinate = evt.coordinate;
      const layer = self.layersMapserver[0].split('_')[0] + ''
      // coordinate = Proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      self.serie = [];
      self.serieData.labels = [];
      self.serieData.datasets = [];
      self.display = false;
      self.coordinate = [];
      self.mapService.getSerie(coordinate, layer, 'value').subscribe(result => {
        self.coordinate = coordinate;
        self.serie = result.data;
        self.serieData.labels = result.data.map(dt => moment(dt.datetime).format('DD/MM/YYYY HH:mm:ss'))
        self.serieData.datasets = [
          { label: 'Camada: ' + layer, data: result.data.map(dt => dt.value.toFixed(1)), tension: 0.5 }
        ]
        self.display = true;
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

  creatLayer(layer: number){
    this.selectedLayerMapserver = this.layersMapserver[layer]
    let visible = false
    let opacity = 0.0

    if (layer < 3){
      visible =  true
      opacity = 0.0
    }
    if (layer == 0){
      visible =  true
      opacity = this.opacity
    }
    return new TileLayer({
      properties:{
        key: layer,
        label: this.selectedLayerMapserver,
        visible: visible
      },
      opacity: opacity,
      visible: visible,
      source: new XYZ({
        urls: [
          `https://o9.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o10.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o11.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
          `https://o12.lapig.iesa.ufg.br/ows?layers=${this.selectedLayerMapserver}&mode=tile&tile={x}+{y}+{z}&tilemode=gmap&map.imagetype=png`,
        ]
      })
    });

  }

  changeLayer(key: number){
    const self = this
    this.map?.getLayers().forEach(layer => {
      let tmpkey = key['value']
      if (layer.get('key') > tmpkey - 15  &&   layer.get('key') < tmpkey + 15    || layer.get('type') === 'base' ){
        if (layer.get('key') === tmpkey || layer.get('type') === 'base' ) {
          layer.setVisible(true)
          layer.setOpacity(self.opacity)
        }else{
          layer.setVisible(true)
          layer.setOpacity(0.0)
        }
      }else{
        layer.setVisible(false)
      }

    });

  }

  onDateChange(ev: any){
    this.selectedLayerMapserver = this.layersMapserver[ev.value];
    this.changeLayer(ev)
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
        opacity: .0
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
    }, 300);
  }

  stop(){
    this.isStopped = true;
    console.log(this.map?.getLayers())
  }

  formatDate(date): string {
    let string = '';
    date = date.replace('t2mj__', '').split("T");
    let dt = date[0]
    let time = date[1].replace('-', ':')
    return dt + ' ' + time;
  }

}

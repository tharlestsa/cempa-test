import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private apiURL = '/service/map';

  static PARAMS = new HttpParams({
    fromObject: {
      format: "json"
    }
  });

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getGeojson(layer): Observable<any> {
    const url = `https://ows-homolog.lapig.iesa.ufg.br/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json`
    return this.httpClient.get<any>(url, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler),
      );
  }

  getWinds(): Observable<any> {
    const url = `https://raw.githubusercontent.com/sakitam-fdd/wind-layer/master/examples/data/wind.json`
    return this.httpClient.get<any>(url, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler),
      );
  }
  getSerie(coordinate): Observable<any> {
    const url = ` https://cempadev.lapig.iesa.ufg.br/service/point/serie?lat=${coordinate[1]}&lon=${coordinate[0]}`
    return this.httpClient.get<any>(url, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler),
      );
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}

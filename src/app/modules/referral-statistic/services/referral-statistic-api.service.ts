import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  AdministrationRoutes,
  CompanyInfo,
  CountryInfo,
  ReferralStatisticsQueryParams,
  ReferralStatisticsWidgetData,
} from '../models/models';
import { map } from 'rxjs/operators';
import * as jsonData from '../_assets/mock.json';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ReferralStatisticApiService {
  baseUrl: string = environment.apiUrl;

  constructor(private readonly _http: HttpClient) {}

  getReferralStatistic(
    payload: ReferralStatisticsQueryParams
  ): Observable<ReferralStatisticsWidgetData> {
    // const params = new HttpParams({ fromObject: { ...payload } });
    // return this._http.get<ReferralStatisticsWidgetData>(this.baseUrl + AdministrationRoutes.ADMINISTRATION + '/get', { params });
    const parsedMockData = JSON.parse(JSON.stringify(jsonData['default']));
    return <Observable<ReferralStatisticsWidgetData>>of(parsedMockData);
  }

  // get a list of countries
  getCountries(search: string): Observable<CountryInfo[]> {
    const params = new HttpParams().set('search', search); //TODO добавить пагинацию и изменить url
    // return this._http.get<CountryInfo[]>(this.baseUrl + AdministrationRoutes.ADMINISTRATION + '/get', { params });
    return of([
      { name: 'United States', code: '+1' },
      { name: 'Canada', code: '+1' },
      { name: 'United Kingdom', code: '+44' },
      { name: 'France', code: '+33' },
      { name: 'Germany', code: '+49' },
      { name: 'Spain', code: '+34' },
      { name: 'Italy', code: '+39' },
      { name: 'Japan', code: '+81' },
      { name: 'China', code: '+86' },
      { name: 'Russia', code: '+7' },
      { name: 'Brazil', code: '+55' },
      { name: 'India', code: '+91' },
      { name: 'Australia', code: '+61' },
      { name: 'South Africa', code: '+27' },
    ]).pipe(
      map((data) =>
        data.filter((c) => c.name.toLocaleLowerCase().includes(search))
      )
    );
  }

  // get a list of company
  getCompanies(search: string): Observable<CompanyInfo[]> {
    const params = new HttpParams().set('search', search); //TODO добавить пагинацию и изменить url
    // return this._http.get<CompanyInfo[]>(this.baseUrl + AdministrationRoutes.ADMINISTRATION + '/get', { params });
    return of([
      { name: 'GlobalTech Solutions', id: '+1' },
      { name: 'International Innovations', id: '+1' },
      { name: 'Advanced Enterprises ', id: '+44' },
      { name: 'Tech Industries Inc.', id: '+33' },
      { name: 'Worldwide Technologies', id: '+49' },
      { name: 'Innovate Services', id: '+34' },
      { name: 'Global Enterprises', id: '+39' },
      { name: 'International Solutions Ltd.', id: '+81' },
      { name: 'Advanced Technologies Group', id: '+86' },
      { name: 'Innovate Industries', id: '+7' },
      { name: 'Tech Solutions International', id: '+55' },
      { name: 'Global Innovations Inc.', id: '+91' },
      { name: 'International Enterprises Ltd.', id: '+61' },
      { name: 'Advanced Tech Services', id: '+27' },
    ]).pipe(
      map((data) =>
        data.filter((c) => c.name.toLocaleLowerCase().includes(search))
      )
    );
  }
}

import { Observable, of } from 'rxjs';
import {
  CompanyInfo,
  CountryInfo,
  ReferralStatisticSources,
  ReferralStatisticsQueryParams,
  ReferralStatisticsWidgetData
} from '../models/models';
import { Injectable } from '@angular/core';
import { ReferralStatisticApiService } from './referral-statistic-api.service';

@Injectable()
export class ReferralStatisticService {
  constructor(private readonly _referralStatisticApi: ReferralStatisticApiService) {}

  getReferralStatisticData$(data?: ReferralStatisticsQueryParams): Observable<ReferralStatisticsWidgetData> {
    return this._referralStatisticApi.getReferralStatistic(data);
  }

  getReferralStatisticSource$(name: string, type: ReferralStatisticSources): Observable<CountryInfo[] | CompanyInfo[]> {
    switch (type) {
      case ReferralStatisticSources.COMPANY:
        return this._getCompaniesList(name);
      case ReferralStatisticSources.COUNTRY:
        return this._getCoutriesList(name);
      default:
        return of([]);
    }
  }

  private _getCoutriesList(name?: string): Observable<CountryInfo[]> {
    return name ? this._referralStatisticApi.getCountries(name) : of([]);
  }

  private _getCompaniesList(name?: string): Observable<CompanyInfo[]> {
    return name ? this._referralStatisticApi.getCompanies(name) : of([]);
  }
}

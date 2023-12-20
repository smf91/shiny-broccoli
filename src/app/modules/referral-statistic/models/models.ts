import { AggregatedDataItem, ChartData } from './data-visualisation.model';

export enum AdministrationRoutes {
  ADMINISTRATION = '/administration'
}

export enum ReferralStatisticSources {
  COUNTRY = 'country',
  COMPANY = 'company'
}

export interface CountryInfo {
  name: string;
  code: string;
}

export interface CompanyInfo {
  name: string;
  id: string;
}

//TODO уточнить формат времени
export interface ReferralStatisticsQueryParams {
  startDate: string;
  endDate: string;
  sourceNames?: string[]; //  или sourceNames?: string[];
  sourceType?: ReferralStatisticSources;
}

export type ReferralStatisticsWidgetData = {
  chartData: ChartData[];
  aggregatedData: AggregatedDataItem[];
};

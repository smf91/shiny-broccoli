export interface BaseDataItem {
  label: string;
  value: number;
  metadata?: MetadataItem;
}

export interface MetadataItem {
  [key: string]: string | number;
}

export interface ChartDataItem extends BaseDataItem {
  timestamp: string | Date;
}

export interface AggregatedDataItem extends BaseDataItem {}

export interface ChartData {
  items: ChartDataItem[];
  aggregatedData?: AggregatedDataItem[];
  metadata?: MetadataItem;
}

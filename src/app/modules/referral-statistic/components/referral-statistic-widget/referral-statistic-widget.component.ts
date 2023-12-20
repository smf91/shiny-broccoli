import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReferralStatisticsWidgetData } from '../../models/models';
import { AggregatedDataItem, ChartData } from '../../models/data-visualisation.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'aop-referral-statistic-widget',
  styleUrls: ['./referral-statistic-widget.component.scss'],
  templateUrl: './referral-statistic-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralStatisticWidgetComponent {
  @Input() set data(data: ReferralStatisticsWidgetData) {
    this._aggregatedData$.next(data.aggregatedData);
    this._chartData$.next(data.chartData);
  }

  private readonly _chartData$: BehaviorSubject<ChartData[]> = new BehaviorSubject<ChartData[]>([]);
  readonly chartData$: Observable<ChartData[]> = this._chartData$.asObservable();

  private readonly _aggregatedData$: BehaviorSubject<AggregatedDataItem[]> = new BehaviorSubject<AggregatedDataItem[]>([]);
  readonly aggregatedData$: Observable<AggregatedDataItem[]> = this._aggregatedData$.asObservable();
}

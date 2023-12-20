import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReferralStatisticService } from '../../services/referral-statistic.service';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { ReferralStatisticsQueryParams, ReferralStatisticsWidgetData } from '../../models/models';
import { catchError, take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'aop-referral-statistic',
  templateUrl: './referral-statistic.component.html',
  styleUrls: ['./referral-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralStatisticComponent implements OnInit {
  private _data$: BehaviorSubject<ReferralStatisticsWidgetData | null> = new BehaviorSubject<ReferralStatisticsWidgetData | null>(null);
  data$: Observable<ReferralStatisticsWidgetData> = this._data$.asObservable();

  private readonly _destroy$: Subject<void> = new Subject<void>();

  constructor(private readonly _referralStatisticService: ReferralStatisticService) {}

  ngOnInit(): void {
    this.subscribeToChartFilter();
  }

  //TODO maybe need to create adapter for ReferralStatisticsRequest
  subscribeToChartFilter(event?: ReferralStatisticsQueryParams): void {
    this._referralStatisticService
      .getReferralStatisticData$(event)
      .pipe(
        take(1),
        tap(data => console.log('data___', data)),
        tap(data => this._data$.next(data)),
        catchError(err => {
          console.error('Some err: ', err.message);
          this._data$.next(null);
          return throwError(() => err);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

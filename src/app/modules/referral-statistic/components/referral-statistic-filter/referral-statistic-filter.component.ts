import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormatDateToString } from '../../_tools/formatter';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CompanyInfo, CountryInfo, ReferralStatisticSources, ReferralStatisticsQueryParams } from '../../models/models';
import { ReferralStatisticService } from '../../services/referral-statistic.service';

@Component({
  selector: 'aop-referral-statistic-filter',
  styleUrls: ['./referral-statistic-filter.component.scss'],
  templateUrl: './referral-statistic-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralStatisticFilterComponent implements OnInit {
  @Output() filterIsAppliedEvent: EventEmitter<ReferralStatisticsQueryParams> = new EventEmitter();
  @Output() filterIsResetedEvent: EventEmitter<undefined> = new EventEmitter();

  readonly sourceTypeNames = Object.values(ReferralStatisticSources);
  private readonly _onFilterEvent$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  readonly onFilterEvent$: Observable<string> = this._onFilterEvent$.asObservable();
  form: FormGroup;
  referralStatisticSource$: Observable<CountryInfo[] | CompanyInfo[]> = this.onFilterEvent$.pipe(
    debounceTime(600),
    distinctUntilChanged(),
    switchMap((searhString: string) => {
      const sourceType = <ReferralStatisticSources>this.form.get('sourceType').value;
      return this._referralStatisticService.getReferralStatisticSource$(searhString.toLocaleLowerCase(), sourceType);
    })
  );

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _referralStatisticService: ReferralStatisticService
  ) {}

  ngOnInit(): void {
    this._initForm();
  }

  submit(): void {
    //TODO  in progress
    this.filterIsAppliedEvent.emit({} as ReferralStatisticsQueryParams);
  }

  reset(): void {
    this.filterIsResetedEvent.emit();
  }

  onDateChange(event: [Date, Date]): void {
    this.form.get('startDate').patchValue(FormatDateToString(event[0]));
    this.form.get('endDate').patchValue(FormatDateToString(event[1]));
  }

  onCustomFilterEvent(searchString: string): void {
    this._onFilterEvent$.next(searchString);
  }

  private _initForm(): void {
    this.form = this._fb.group({
      sourceType: new FormControl(null),
      sourceNames: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null)
    });
  }
}

import { NgModule } from '@angular/core';
import { ReferralStatisticComponent } from './components/referral-statistic/referral-statistic.component';
import { ReferralStatisticService } from './services/referral-statistic.service';
import { ReferralStatisticApiService } from './services/referral-statistic-api.service';
import { ReferralStatisticWidgetComponent } from './components/referral-statistic-widget/referral-statistic-widget.component';
import { ReferralStatisticFilterComponent } from './components/referral-statistic-filter/referral-statistic-filter.component';
import { DropdownMultiselectorComponent } from './components/dropdown-multiselector/dropdown-multiselector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReferralStatisticChartComponent } from './components/referral-statistic-chart/referral-statistic-chart.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

const components = [
  ReferralStatisticComponent,
  ReferralStatisticWidgetComponent,
  ReferralStatisticFilterComponent,
  DropdownMultiselectorComponent,
  ReferralStatisticChartComponent,
];

@NgModule({
  imports: [HttpClientModule, CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [...components],
  exports: [...components],
  providers: [ReferralStatisticService, ReferralStatisticApiService],
})
export class ReferralStatisticModule {}

import * as d3 from 'd3';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {
  ChartData,
  ChartDataItem,
} from '../../models/data-visualisation.model';

enum ChartsColors {
  GREEN = '#45B271',
  LIGHT_GREEN = '#8CE5AF',
  BLUE = '#5F85BD',
  LIGHT_BLUE = '#AAC7F2',
}

interface AxesMap {
  [key: string]: d3.Axis<any>;
}

@Component({
  selector: 'aop-referral-statistic-chart',
  styleUrls: ['./referral-statistic-chart.component.scss'],
  templateUrl: './referral-statistic-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferralStatisticChartComponent implements AfterViewInit {
  @Input() set data(data: ChartData[]) {
    this._data = data.map((d) => ({
      ...d,
      items: d.items.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })),
    }));
  }

  get data(): ChartData[] {
    return this._data;
  }

  private _data: ChartData[];

  @ViewChild('chart') chart: ElementRef;
  margin = { top: 20, right: 0, bottom: 25, left: 20 };
  width: number;
  height: number;

  xAxes: AxesMap = {};
  yAxes: AxesMap = {};
  lineGenerators: ((data: any) => d3.Line<[number, number]>)[] = [];
  // or
  // lineGenerators: ((data: ChartData) => d3.Line<[number, number]>)[] = [];

  ngAfterViewInit(): void {
    console.log('ChartData____________', this.data);
    this.createChart();
  }

  createChart(): void {
    this._initializationParamsChart();
    this._createXaxes();
    this._createYaxes();
    this._createLineGenerators();
    this._createSVGcontainer();
  }

  private _initializationParamsChart(): void {
    this.width =
      this.chart.nativeElement.clientWidth -
      (this.margin.left + this.margin.right);
    this.height =
      this.chart.nativeElement.clientHeight -
      (this.margin.top + this.margin.bottom);
    console.log('this.width', this.width);
    console.log('this.height', this.height);
  }

  private _createXaxes(): void {
    this.data.forEach((chartData) => {
      this.xAxes[chartData.metadata['sourceName']] = d3
        .scaleUtc()
        .domain([
          d3.min(chartData.items, (item) => item.timestamp),
          d3.max(chartData.items, (item) => item.timestamp),
        ])
        .range([this.margin.left, this.width - this.margin.right]);
    });
  }

  private _createYaxes(): void {
    let domainMin = Infinity;
    let domainMax = -Infinity;
    this.data.forEach((chartData: ChartData) => {
      const minVal: number = d3.min(
        chartData.items,
        (item: ChartDataItem) => item.value
      );
      const maxVal: number = d3.max(
        chartData.items,
        (item: ChartDataItem) => item.value
      );
      if (minVal < domainMin) domainMin = minVal;
      if (maxVal > domainMax) domainMax = maxVal;
    });
    const yScale = d3
      .scaleLinear()
      .domain([0, domainMax])
      .range([this.height - this.margin.bottom, this.margin.top]);
    this.data.forEach((chartData: ChartData) => {
      // TODO Scale should be typed after npm install --save @types/d3
      this.yAxes[chartData.metadata['sourceName']] = yScale;
    });
  }

  private _createLineGenerators(): void {
    this.lineGenerators = this.data.map((chartData: ChartData) =>
      d3
        .line()
        .x((d: ChartDataItem) =>
          this.xAxes[chartData.metadata['sourceName']](d.timestamp)
        )
        .y((d: ChartDataItem) =>
          this.yAxes[chartData.metadata['sourceName']](d.value)
        )
    );
  }

  private _createSVGcontainer(): void {
    // TODO svg should be typed after npm install --save @types/d3
    const svg = d3
      .create('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      // .attr('style', 'max-width: 100%; height: 400px;');
      // .attr('style', 'width: 100%; height: 400px;');
      .attr('class', 'svg-container');

    this.chart.nativeElement.appendChild(svg.node());
    // TODO should be typed
    this._appendXaxes(svg);
    this._appendYaxes(svg);
    this._appendPaths(svg);
    //______________________
  }

  private _appendXaxes(svg: any): void {
    this.data.forEach((chartData, i) => {
      svg
        .append('g')
        .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
        .call(
          d3
            .axisBottom(this.xAxes[chartData.metadata['sourceName']])
            .ticks(this.width / 50)
            .tickSizeOuter(0)
        );
    });
  }

  private _appendYaxes(svg: any): void {
    this.data.forEach((chartData, i) => {
      svg
        .append('g')
        .attr('transform', `translate(${this.margin.left},0)`)
        .call(
          d3
            .axisLeft(this.yAxes[chartData.metadata['sourceName']])
            .ticks(this.height / 25)
        )
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .selectAll('.tick line')
            .clone()
            .attr('x2', this.width - this.margin.left - this.margin.right)
            .attr('stroke-opacity', 0.1)
        )
        .call((g) =>
          g
            .append('text')
            .attr('x', -this.margin.left)
            .attr('y', 10)
            .attr('fill', 'blue')
            .attr('text-anchor', 'start')
            .text('↑ value')
        );
    });
  }

  private _appendPaths(svg: any): void {
    console.log('this.data', this.data);
    console.log('this.xA', this.xAxes);
    console.log('this.yA', this.yAxes);
    console.log('this.lineGenerators', this.lineGenerators);
    this.data.forEach((chartData, i) => {
      svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', chartData.metadata['mark'])
        .attr('stroke-width', 1.5)
        .attr('d', this.lineGenerators[i](chartData.items));
    });
  }
}

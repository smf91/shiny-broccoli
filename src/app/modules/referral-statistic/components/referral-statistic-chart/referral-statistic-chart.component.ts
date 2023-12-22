import * as d3 from 'd3';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ChartData,
  ChartDataItem,
} from '../../models/data-visualisation.model';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  distinctUntilChanged,
  fromEvent,
  map,
  mergeMap,
  of,
  takeUntil,
  tap,
} from 'rxjs';
import {
  CompareTimestamps,
  BinarySearchNearestPoint,
} from '../../_tools/utils';

interface AxesMap {
  [key: string]: d3.Axis<any>;
}
interface DataPoint {
  item: ChartDataItem;
  lineIndex: number;
  sourceName: string | number;
}

@Component({
  selector: 'aop-referral-statistic-chart',
  styleUrls: ['./referral-statistic-chart.component.scss'],
  templateUrl: './referral-statistic-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferralStatisticChartComponent
  implements AfterViewInit, OnDestroy
{
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

  @ViewChild('chart') chart: ElementRef<HTMLDivElement>;
  margin = { top: 20, right: 0, bottom: 25, left: 20 };
  width: number;
  height: number;
  xAxes: AxesMap = {};
  yAxes: AxesMap = {};
  lineGenerators: ((data: any) => d3.Line<[number, number]>)[] = [];
  // or
  // lineGenerators: ((data: ChartData) => d3.Line<[number, number]>)[] = [];
  xTickSize = 80;
  yTickSize = 25;
  private readonly _detailsPopup$ = new BehaviorSubject<DataPoint[]>([]);
  readonly detailsPopup$ = this._detailsPopup$.asObservable();
  private _data: ChartData[];
  private _mouseMove$: Observable<MouseEvent>;
  private readonly _destroy$: Subject<void> = new Subject<void>();

  get chartContainer(): HTMLDivElement {
    return this.chart.nativeElement;
  }

  ngAfterViewInit(): void {
    this.createChart();
    this._subscribeMouseMove();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  createChart(): void {
    this._calculateChartSize();
    this._createXaxes();
    this._createYaxes();
    this._createLineGenerators();
    this._createSVGcontainer();
    this._subscribeUpdateDataPointMarkers();
  }

  private _calculateChartSize(): void {
    this.width =
      this.chart.nativeElement.clientWidth -
      (this.margin.left + this.margin.right);
    this.height =
      this.chart.nativeElement.clientHeight -
      (this.margin.top + this.margin.bottom);
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
      .attr('class', 'svg-container');
    // create cursor
    this._createCrosshairVerticalLine(svg);
    this._createCrosshairHorizontalLine(svg);
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
            .ticks(this.width / this.xTickSize)
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
            .ticks(this.height / this.yTickSize)
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
    this.data.forEach((chartData, i) => {
      svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', chartData.metadata['mark'])
        .attr('stroke-width', 1.5)
        .attr('d', this.lineGenerators[i](chartData.items))
        .attr('class', `line-${i}`);
    });
  }

  private _subscribeMouseMove(): void {
    const crosshairLines = d3.selectAll('.crosshair-line');
    this._mouseMove$ = fromEvent<MouseEvent>(this.chartContainer, 'mousemove');

    const rect = this.chartContainer.getBoundingClientRect();
    this._mouseMove$
      .pipe(
        // debounceTime(40),
        map((event) => {
          // Getting the cursor position relative to the chart...
          const x = event.clientX - rect.left - this.margin.left;
          const y = event.clientY - rect.top - this.margin.top;
          return { x, y };
        }),
        map((position) => {
          if (
            position.x >= 0 &&
            position.x <= this.width &&
            position.y >= 0 &&
            position.y <= this.height
          ) {
            return position;
          } else {
            //TODO should be checked
            return { x: 0, y: 0 };
          }
        }),
        distinctUntilChanged(
          // filtering the same positions
          (prev, curr) => prev.x === curr.x && prev.y === curr.y
        ),
        mergeMap((position) => {
          if (position.x !== 0 && position.y !== 0) {
            // TODO  отрефакторить с _createCrosshairVerticalLine и _createCrosshairHorizontalLine
            // vertical line
            crosshairLines
              .filter((_, i) => i === 0)
              .attr('x1', position.x + this.margin.left)
              .attr('x2', position.x + this.margin.left)
              .attr('y1', 0)
              .attr('y2', this.height)
              .style('opacity', 1);
            // horizontal line
            crosshairLines
              .filter((_, i) => i === 1)
              .attr('x1', 0)
              .attr('x2', this.width)
              .attr('y1', position.y + this.margin.top)
              .attr('y2', position.y + this.margin.top)
              .style('opacity', 1);

            this.chartContainer.style.cursor = 'none';
          } else {
            crosshairLines.style('opacity', 0);
          }

          const nearestDataPoints: DataPoint[] = this._findNearestDataPoints(
            position.x,
            position.y
          );
          return nearestDataPoints ? of(nearestDataPoints) : EMPTY;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe((nearestDataPoints) => {
        this._detailsPopup$.next(nearestDataPoints);
      });
  }

  private _createCrosshairVerticalLine(svg: any): void {
    svg
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', this.height)
      .style('stroke', 'gray')
      .style('stroke-width', 1)
      .style('opacity', 0);
  }

  private _createCrosshairHorizontalLine(svg: any): void {
    svg
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', 'gray')
      .style('stroke-width', 1)
      .style('opacity', 0);
  }

  private _findNearestDataPoints(x: number, y: number): DataPoint[] {
    const nearestDataPoints: DataPoint[] = [];

    this.data.forEach((data: ChartData, lineIndex: number) => {
      const sortedData = data.items.sort((a, b) =>
        CompareTimestamps(a.timestamp, b.timestamp)
      );
      const closestIndex = BinarySearchNearestPoint(
        sortedData,
        x,
        y,
        (dataPoint) =>
          this.xAxes[data.metadata['sourceName']](dataPoint.timestamp),
        (dataPoint) => this.yAxes[data.metadata['sourceName']](dataPoint.value)
      );

      if (closestIndex !== -1) {
        nearestDataPoints.push({
          item: sortedData[closestIndex],
          lineIndex,
          sourceName: data.metadata['sourceName'],
        });
      }
    });

    return nearestDataPoints;
  }

  private _subscribeUpdateDataPointMarkers(): void {
    this.detailsPopup$
      .pipe(
        tap(() => this._removeMarkers()),
        tap((nearestDataPoints) => {
          const svg = d3.select(this.chart.nativeElement).select('svg');
          nearestDataPoints.forEach((point: DataPoint) => {
            const x = this.xAxes[point.sourceName](point.item.timestamp);
            const y = this.yAxes[point.sourceName](point.item.value);
            this._createMarker(svg, x, y);
          });
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  private _createMarker(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number
  ): void {
    svg
      .append('circle')
      .attr('cx', Math.round(x))
      .attr('cy', Math.round(y))
      .attr('r', 5)
      .attr('class', 'data-point-marker');
  }

  private _removeMarkers(): void {
    d3.select(this.chartContainer).selectAll('.data-point-marker').remove();
  }
}

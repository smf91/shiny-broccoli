import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type MultiselectorOption = unknown;

@Component({
  selector: 'aop-dropdown-multiselector',
  templateUrl: 'dropdown-multiselector.component.html',
  styleUrls: ['./dropdown-multiselector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownMultiselectorComponent),
      multi: true,
    },
  ],
})
export class DropdownMultiselectorComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  @Input() set searchText(t: string) {
    this.onFilterEvent.next(t);
  }
  @Input() labelControl = '';
  @Input() placeholder = '';
  @Input() options: MultiselectorOption[] = [];
  @Input() optionLabel = 'name';
  @Input() optionValue = 'value';
  @Output() onFilterEvent: EventEmitter<string> = new EventEmitter();
  @ViewChild('dropdownMultiselect') dropdownElement: ElementRef;

  private readonly _isDropdownOpen$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  readonly isDropdownOpen$: Observable<boolean> =
    this._isDropdownOpen$.asObservable();

  private readonly _selectedOptions$: BehaviorSubject<MultiselectorOption[]> =
    new BehaviorSubject<[]>([]);
  readonly selectedOptions$: Observable<MultiselectorOption[]> =
    this._selectedOptions$.asObservable();

  private readonly _destroy$: Subject<void> = new Subject<void>();

  ngAfterViewInit(): void {
    this._subscribeFocusInEvent();
  }

  writeValue(selectedOptions: MultiselectorOption): void {
    if (selectedOptions && Array.isArray(selectedOptions)) {
      this.options.forEach((option) => {
        option[this.optionValue] = selectedOptions.includes(
          option[this.optionLabel]
        );
      });
    }
  }
  clearSelections(): void {}

  onChange(_: any): void {}
  onTouched(_: any): void {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onOptionChange(option: MultiselectorOption): void {
    const selectedOptions = this.options
      .filter((o) => o[this.optionValue])
      .map((o) => o[this.optionLabel]);
    this._selectedOptions$.next(selectedOptions);
    this.onChange(selectedOptions);
  }

  @HostListener('document:click', ['$event'])
  private _onClick(event: MouseEvent): void {
    const isClickInsideDropdown = this.dropdownElement.nativeElement.contains(
      event.target as Node
    );
    if (!isClickInsideDropdown) this._isDropdownOpen$.next(false);
  }

  private _subscribeFocusInEvent(): void {
    fromEvent(this.dropdownElement.nativeElement, 'focusin')
      .pipe(
        tap(() => this._isDropdownOpen$.next(true)),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

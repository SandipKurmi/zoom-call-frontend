import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { createSwapy } from 'swapy';

@Component({
  selector: 'app-swapy-app',
  standalone: true,
  imports: [],
  templateUrl: './swapy-app.component.html',
  styleUrl: './swapy-app.component.css',
})
export class SwapyAppComponent implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  swapy: any;
  slotItems: Record<string, 'a' | 'c' | 'd' | null> = localStorage.getItem(
    'slotItem'
  )
    ? JSON.parse(localStorage.getItem('slotItem')!)
    : {
        '1': 'a',
        '3': 'c',
        '4': 'd',
        '2': null,
      };

  getItemById(itemId: 'a' | 'c' | 'd' | null) {
    switch (itemId) {
      case 'a':
        return AComponent;
      case 'c':
        return CComponent;
      case 'd':
        return DComponent;
      default:
        return null;
    }
  }

  ngOnInit() {
    this.swapy = createSwapy(this.container.nativeElement);
    this.swapy.onSwap(({ data }: any) => {
      console.log(data);
      localStorage.setItem('slotItem', JSON.stringify(data.object));
    });
  }
}

@Component({
  selector: 'app-a',
  template: `
    <div class="item a" data-swapy-item="a">
      <div class="handle" data-swapy-handle></div>
      <div>A</div>
    </div>
  `,
})
export class AComponent {}

@Component({
  selector: 'app-c',
  template: `
    <div class="item c" data-swapy-item="c">
      <div>C</div>
    </div>
  `,
})
export class CComponent {}

@Component({
  selector: 'app-d',
  template: `
    <div class="item d" data-swapy-item="d">
      <div>D</div>
    </div>
  `,
})
export class DComponent {}

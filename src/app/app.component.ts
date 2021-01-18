import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  isDrawing = false;
  coordX = 0;
  coordY = 0;
  onGoingTouches = [];
  context;

  constructor(private elementRef: ElementRef, private renderer2: Renderer2) {}

  ngAfterViewInit() {
    this.context = this.getContext2d();
    this.listenToCursorDownChanges();
    this.listenToCursorMoveChanges();
    this.listenToCursorUpChanges();
    this.listenToTouchEvents();
  }

  getContext2d() {
    return this.elementRef.nativeElement
      .querySelector('#drawer')
      .getContext('2d');
  }

  listenToCursorDownChanges() {
    this.canvas.nativeElement.addEventListener('mousedown', (e) => {
      this.coordX = e.offsetX;
      this.coordY = e.offsetY;
      this.isDrawing = true;
    });
  }

  listenToCursorMoveChanges() {
    this.canvas.nativeElement.addEventListener('mousemove', (e) => {
      if (this.isDrawing === true) {
        this.drawLine(
          this.context,
          this.coordX,
          this.coordY,
          e.offsetX,
          e.offsetY
        );
        this.coordX = e.offsetX;
        this.coordY = e.offsetY;
      }
    });
  }

  listenToCursorUpChanges() {
    this.canvas.nativeElement.addEventListener('mouseup', (e) => {
      if (this.isDrawing) {
        this.drawLine(
          this.context,
          this.coordX,
          this.coordY,
          e.offsetX,
          e.offsetY
        );
        this.coordX = 0;
        this.coordY = 0;
        this.isDrawing = false;
      }
    });
  }

  listenToTouchEvents() {
    this.canvas.nativeElement.addEventListener('touchstart', (e) => {
      this.handleStart(e);
    });

    this.canvas.nativeElement.addEventListener('touchend', (e) => {
      this.handleEnd(e);
    });

    this.canvas.nativeElement.addEventListener('touchcancel', (e) => {
      this.handleCancel(e);
    });

    this.canvas.nativeElement.addEventListener('touchleave', (e) => {
      this.handleEnd(e);
    });

    this.canvas.nativeElement.addEventListener('touchmove', (e) => {
      this.handleMove(e);
    });
  }

  handleStart(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      if (!this.onGoingTouches) {
        this.onGoingTouches = [];
      }
      this.onGoingTouches.push({
        identifier: touches[i].identifier,
        pageX: touches[i].pageX,
        pageY: touches[i].pageY,
      });
      const drawColor = '#000000';
      this.context.beginPath();
      this.context.fillStyle = drawColor;
      this.context.fill();
    }
  }

  ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < this.onGoingTouches.length; i++) {
      const id = this.onGoingTouches[i].identifier;

      if (id == idToFind) {
        return i;
      }
    }
    return -1;
  }

  handleMove(evt) {
    evt.preventDefault();
    const el = this.canvas.nativeElement;
    const ctx = el.getContext('2d');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const drawColor = '#000000';
      const idx = this.ongoingTouchIndexById(touches[i].identifier);

      if (idx >= 0) {
        ctx.beginPath();
        ctx.moveTo(
          this.onGoingTouches[idx].pageX,
          this.onGoingTouches[idx].pageY
        );
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = drawColor;
        ctx.stroke();

        this.onGoingTouches.splice(idx, 1, {
          identifier: touches[i].identifier,
          pageX: touches[i].pageX,
          pageY: touches[i].pageY,
        });
      }
    }
  }

  handleEnd(evt) {
    evt.preventDefault();
    const el = this.canvas.nativeElement;
    const ctx = el.getContext('2d');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const drawColor = '#00000';
      const idx = this.ongoingTouchIndexById(touches[i].identifier);

      if (idx >= 0) {
        ctx.lineWidth = 4;
        ctx.fillStyle = drawColor;
        ctx.beginPath();
        ctx.moveTo(
          this.onGoingTouches[idx].pageX,
          this.onGoingTouches[idx].pageY
        );
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        this.onGoingTouches.splice(idx, 1);
      }
    }
  }

  handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      this.onGoingTouches.splice(i, 1);
    }
  }

  onTouch(evt) {
    evt.preventDefault();
    if (
      evt.touches.length > 1 ||
      (evt.type == 'touchend' && evt.touches.length > 0)
    )
      return;

    let newEvt = document.createEvent('MouseEvents');
    let type = null;
    let touch = null;
    switch (evt.type) {
      case 'touchstart':
        type = 'mousedown';
        touch = evt.changedTouches[0];
        break;
      case 'touchmove':
        type = 'mousemove';
        touch = evt.changedTouches[0];
        break;
      case 'touchend':
        type = 'mouseup';
        touch = evt.changedTouches[0];
        break;
    }
    newEvt.initMouseEvent(
      type,
      true,
      true,
      evt.originalTarget.ownerDocument.defaultView,
      0,
      touch.screenX,
      touch.screenY,
      touch.clientX,
      touch.clientY,
      evt.ctrlKey,
      evt.altKey,
      evt.shirtKey,
      evt.metaKey,
      0,
      null
    );
    evt.originalTarget.dispatchEvent(newEvt);
  }

  drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }

  downloadCanvas() {
    const image = this.canvas.nativeElement.toDataURL('image/jpg');
    const anchor = this.renderer2.createElement('a');
    anchor.href = image;
    anchor.download = 'assinatura.jpg';
    anchor.click();
    anchor.remove();
  }
}

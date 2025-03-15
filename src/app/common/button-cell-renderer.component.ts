import {Component, Input} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";
import './string.extensions';


export interface ButtonConfig {
  buttonText?: string
  buttonIconClass?: string
  buttonClass?: string
  buttonDisable?: boolean
  buttonVisible?: any
  row?: object

  clicked($event: Event, param?: any): Promise<boolean> | boolean
}

@Component({
  selector: 'btn-cell-renderer',
  template: `
    <!--<button *ngFor="let conf of buttonConfig;"
            [class]="conf.buttonClass" (click)="conf.clicked($event)">
      {{conf.buttonText}}<i class="feather text-primary" [className]="conf.buttonIconClass"></i>
    </button>-->
    <!--<div class="mb-1"><div style="float:left" *ngFor="let conf of buttonConfig"> <button type="button" *ngIf="checkCondition(conf.buttonVisible)"
                 [class]="'btn btn-outline-primary btn-icon '+conf.buttonClass" (click)="conf.clicked($event, params)">
      {{conf.buttonText}}<i class="feather text-primary" [className]="'feather '+conf.buttonIconClass" disabled="conf.buttonDisable"></i>
    </button></div></div>-->


    <div><div style="float:left" *ngFor="let conf of buttonConfig"> <button type="button" *ngIf="run(conf.buttonVisible || 'true')"
    [class]="'btn btn-outline-primary btn-icon '+conf.buttonClass" (click)="conf.clicked($event, params)">
{{conf.buttonText}}<i class="feather text-primary" [className]="'feather '+conf.buttonIconClass" disabled="conf.buttonDisable"></i>
</button></div></div>

  `,
})
export class BtnCellRenderer implements ICellRendererAngularComp {
  @Input() public buttonConfig: ButtonConfig[]
  public params: any;

  agInit(params: ICellRendererParams): void {

    this.params = params;
    this.buttonConfig = params.colDef?.cellRendererParams;
    console.log("----->>>>>==", this.params)

  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    // throw new Error("Method not implemented.");
    return true;
  }

  // btnClickedHandler($event: Event) {
  //   this.params.clicked(this.params.value);
  // }
  checkCondition(visibleConf: any={}): boolean{
    let cond = false;
    let keylist = Object.keys(visibleConf)
    if(keylist.length==0){return true}
    keylist.forEach((k)=>{
      if(this.params.data[k] != visibleConf[k]){
        cond = true
        return false;
      }
      return true;
    })
    console.log(cond)
    return cond;
  }

  run(condition: string) {
    let e = eval(condition.interpolate(this.params.data));

    return e ;
  }
}

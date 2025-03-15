import {SampleComponent} from "./sample.component";
import {TestComponent} from "./test/test.component";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: SampleComponent},
      {path: 'test', component: TestComponent}
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleRoutingModule {
}

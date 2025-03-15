import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BaseComponent} from './views/layout/base/base.component';
import {AuthGuard} from './core/guard/auth.guard';
import {ErrorPageComponent} from './views/pages/error-page/error-page.component';
import {ChangePasswordComponent} from "./views/pages/auth/change-password/change-password.component";
import {SelfOnboardingComponent} from "./views/pages/merchants/self-onboarding/self-onboarding.component";
import { NewBaseComponent } from './views/layout/new-base/new-base.component';
import { LandingPageComponent } from './views/pages/general/landing-page/landing-page.component';


const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule),
    data: { breadcrumb: {alias: 'Parent'} },
  },
  {
    path: 'merchant/self-onbaording',
    component: SelfOnboardingComponent
  },
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: {alias: 'General'} },
    children: [
      {
        path: 'change-password',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Change Password'} },
        component: ChangePasswordComponent
      },{
        path: 'general',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'General'} },
        loadChildren: () => import('./views/pages/general/general.module').then(m => m.GeneralModule)
      },
      {
        path: 'sample',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Sample'} },
        loadChildren: () => import('./views/pages/sample/sample.module').then(m => m.SampleModule)
      },
      {
        path: 'merchants',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Merchant Setup'} },
        loadChildren: () => import('./views/pages/merchants/merchants.module').then(m => m.MerchantsModule)
      },
      {
        path: 'reseller',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Reseller Management'} },
        loadChildren: () => import('./views/pages/resellers/resellers.module').then(m => m.ResellersModule)
      },
      {
        path: 'riskdashboard',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Risk Dashboard'} },
        loadChildren: () => import('./views/pages/riskdashboard/riskdashboard.module').then(m => m.RiskdashboardModule)
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Dashboard'} },
        loadChildren: () => import('./views/pages/chart-graphs/chart-graphs.module').then(m => m.ChartsGraphsModule)
      },
      {
        path: 'reconmanagement',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Recon Management'} },
        loadChildren: () => import('./views/pages/recon-management/recon-management.module').then(m => m.ReconManagementModule)
      },
      {
        path: 'refundmanagement',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Refund Management'} },
        loadChildren: () => import('./views/pages/refund-management/refund-management.module').then(m => m.RefundManagementModule)
      },
      {
        path: 'Master',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Master Management'} },
        loadChildren: () => import('./views/pages/master/master.module').then(m => m.MasterModule)
      },

      {
        path: 'Chargeback',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Chargeback'} },
        loadChildren: () => import('./views/pages/charge-back/charge-back.module').then(m => m.ChargeBackModule)
      },

      {
        path: 'payout&settlement',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Payout & Settlement'} },
        loadChildren: () => import('./views/pages/payout-settlement/payout-settlement.module').then(m => m.PayoutSettlementModule)
      },

      {
        path: 'riskconfig',
        canActivate: [AuthGuard],
        data: { breadcrumb: {alias: 'Risk Config'} },
        loadChildren: () => import('./views/pages/riskmanagement/riskmanagement.module').then(m => m.RiskmanagementModule)
      },
      {path: '', redirectTo: 'general', pathMatch: 'full'},
    ]
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  {path: '**', redirectTo: 'error', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'top', onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor() {
  }
}

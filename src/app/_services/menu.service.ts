import {Injectable} from '@angular/core';
import {BehaviorSubject, lastValueFrom} from 'rxjs';
import {MenuItem} from "../views/layout/sidebar/menu.model";
import {StorageService} from "./storage.service";
import {AuthService} from "../views/pages/auth/auth.service";
import {AlertService} from './alert.service';
import {MerchantService} from "../views/pages/merchants/merchant-master/merchant.service";

@Injectable({
  providedIn: 'root'
})
export class MenusService {

  private menuData: MenuItem[] = [];
  private menuSource = new BehaviorSubject(this.menuData);
  currentMenus = this.menuSource.asObservable();

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private alertService: AlertService,
    private merchantService: MerchantService
  ) {
  }

  changeMenus(menuData: MenuItem[]) {
    this.menuSource.next(this.BindMenuVariable(menuData));
  }

  BindMenuVariable(menuData: MenuItem[]) {
    return menuData;
  }

  async getProgress(){
    const username = this.storageService.getUserName()
    let merchantDetails: any;

    let progressCount= 10;

    const merchantDetails$ = this.merchantService.getMerchant(username);
    merchantDetails = await lastValueFrom(merchantDetails$);
    console.log("-------->>>>>>>====>", merchantDetails[0].status)
    if(merchantDetails[0].status =='Self-Initiated'){
      progressCount = 10
    }
    // if(merchantDetails[0].status.includes(['Pending' ,'Initiated' ,'Re-Initiated'])){
    if((['Pending' ,'Initiated' ,'Re-Initiated']).includes(merchantDetails[0].status)){
      progressCount = 20
    }
    if(merchantDetails[0].status =='Pending' && (!merchantDetails[0].kyc_approvel || !merchantDetails[0].risk_approvel )){
      progressCount = 20
    }
    if(merchantDetails[0].status =='Active' ){
      progressCount = 40
    }

    return (progressCount / 40) * 100
  }

  async structuredMenu(menuArray: any[], pMenuId?: any) {debugger
    const username = this.storageService.getUserName()
    let merchantDetails: any;

    const merchantDetails$ = this.merchantService.getMerchant(username);
    merchantDetails = await lastValueFrom(merchantDetails$);

    let finalMenus = [];
    let sidebarMenus: any = [];
    menuArray = menuArray.sort((a, b) => a?.Position && b?.Position ? a.Position - b.Position : 0)
    let pIdSt: any;
    const level1 = menuArray.filter((m) => m.PMenuId === (pMenuId || 0)).filter((m) => {
      if (merchantDetails[0].status == 'Active') {
        return m;
      } else {
        if (m.MenuName == 'Merchant Master' || m.MenuName == 'Merchant Setup') {
          pIdSt = m.MenuId;
          return m;
        }else /*if(m.PMenuId > 0)*/{
          return {...m, disabled:true};
        }
      }
    })
    debugger
    finalMenus.push(...level1);
    sidebarMenus.push(...level1.map((m) => {debugger
      return {
        id: m.MenuId,
        label: (m.MenuName == 'Merchant Master' ? 'Self Onboarding' : m.MenuName),
        title: m.Title?.replace('TITLE', '').replace('Title', '').trim(),
        link: (m.MenuName == 'Merchant Master' ? '/merchants/self-onboarding' : m.MenuLink),
        icon: m.Icon || 'home',
        Service_type: m.Service_type || '0',
        disabled: !!m.disabled
      }
    }));
    sidebarMenus = sidebarMenus.map((m: any) => {debugger
      m['subItems'] = menuArray.filter((ml) => ml.PMenuId === m.id).map((m) => {
        return {
          id: m.MenuId,
          label: (m.MenuName == 'Merchant Master' ? 'Self Onboarding' : m.MenuName),
          link: (m.MenuName == 'Merchant Master' ? '/merchants/self-onboarding' : m.MenuLink),
          disabled: !!m.disabled,
          Service_type: m.Service_type || '0',
          icon: m.Icon || 'circle',
        }
      });
      return m;
    });

    finalMenus = finalMenus.map((m) => {
      m['children'] = menuArray.filter((ml) => ml.PMenuId === m.MenuId);
      return {...m, disabled: !!m.disabled};
    });

    finalMenus = finalMenus.map((m1) => {
      m1['children'] = m1.children.map((m2: { [x: string]: any[]; MenuId: any; }) => {
        m2['children'] = menuArray.filter((ml) => ml.PMenuId === m2.MenuId);
        return {...m2, disabled: !!m2.disabled};
      });
      return {...m1, disabled: !!m1.disabled};
    })

    sidebarMenus = sidebarMenus.map((m1: any) => {
      m1['subItems'] = m1['subItems'].map((m2: any) => {
        m2['subItems'] = menuArray.filter((ml) => ml.PMenuId === m2.id).map((m) => {debugger
          return {
            id: m.MenuId,
            label: (m.MenuName == 'Merchant Master' ? 'Self Onboarding' : m.MenuName),
            title: m.Title,
            link: (m.MenuName == 'Merchant Master' ? '/merchants/self-onboarding' : m.MenuLink),
            icon: m.Icon || 'home',
            Service_type: m.Service_type || '0',
            disabled: !!m.disabled
          }
        });
        return {...m2, disabled: !!m2.disabled};
      });
      return {...m1, disabled: !!m1.disabled};
    })

    return {finalMenus, sidebarMenus, rawMenus: menuArray};
  }

  saveMenusItems(menuArray: any) {debugger
    this.storageService.saveMenuItems(menuArray);
  }

  getMenusItems(): any {
    const menusItems = this.storageService.getMenuItems();
    if (menusItems) {
      return menusItems;
    } else {
      return this.authService.getProfile().subscribe((data) => {
        const {Menu} = data;
        this.structuredMenu(Menu).then((structMenu)=>{
          this.saveMenusItems(structMenu);
          if (structMenu.finalMenus[0].ROLENAME != "Merchant") {
            this.alertService.errorAlert({
              title: "No Access! Contact Administrator",
              backdrop: true,
              toast: true,
              timer: 2000, position: 'top-end'
            })
            this.authService.logout();


          }
          return structMenu;
        });

      }, () => {

        return;
      })
    }


  }

  getPermissions(path: string): any {
    if (path.charAt(0) === '#') {
      path = path.slice(1);
    }
    if (path.indexOf(";") > -1) {
      path = path.substr(0, path.indexOf(";"));
    }

    path = path.split('?')[0]
    const data = this.getMenusItems();
    const {rawMenus} = data;
    if (rawMenus) {
      const currentMenuDetails = rawMenus?.find((m: any) => m.MenuLink == path);
      // console.log(currentMenuDetails, "===============>");
      return currentMenuDetails?.PermissionAction || ''
    } else {
      return;
    }
  }

}

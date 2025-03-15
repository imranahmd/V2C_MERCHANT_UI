import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Injectable,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {DOCUMENT, Location} from '@angular/common';

import MetisMenu from 'metismenujs';
import {MenuItem} from './menu.model';
import {NavigationEnd, Route, Router} from '@angular/router';
import {UserService} from "../../../_services/user.service";
import {SideNavService} from "./side-name.service";
import {StorageService} from "../../../_services/storage.service";
import {MenusService} from "../../../_services/menu.service";
import {environment} from "../../../../environments/environment";
import {AlertService} from 'src/app/_services/alert.service';
import {AuthService} from 'src/app/views/pages/auth/auth.service';
import {lastValueFrom} from "rxjs";
import {MerchantService} from "../../pages/merchants/merchant-master/merchant.service";

const {level3_exclude} = environment

const routeConst = [
  {
    title: 'Merchant Master',
    path: '/merchants/reseller-master'
  }
]

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
@Injectable()
export class SidebarComponent implements OnInit, AfterViewInit {

  @ViewChild('sidebarToggler') public sidebarToggler: ElementRef;

  menuItems: MenuItem[] = [];
  levelExclude = [...level3_exclude]
  menus: any[];
  ImageShow :boolean=false;
  mm: MetisMenu;
  merchantDetails: any
  @ViewChild('sidebarMenu') sidebarMenu: ElementRef;
  @ViewChild('menu') menuElement: any;

  @ViewChildren('menuListItem') menuListItems: QueryList<any>;
  ImagePath: string | null;
  type: any;
  mode: string | null;

  constructor(@Inject(DOCUMENT) private document: Document, private authService: AuthService, private alertService: AlertService, private location: Location, private menuService: MenusService, private renderer: Renderer2, private router: Router, private userService: UserService, private storageService: StorageService, public sideNavService: SideNavService, private merchantService: MerchantService) {
    try {debugger
      this.userService.getUserProfileNew().subscribe((data) => {debugger
        if (this.mm) this.mm.dispose();
        // const {Menu} = data;
        let Menu 
        this.ImagePath = data?.Data||localStorage.getItem('logo');
        // localStorage.setItem("type",data?.GROUPID?.split('#')[1])
        this.mode = localStorage.getItem("mode")
        if(data?.GROUPID?.split('#')[1]=='Payout'||this.mode =='2'){
          this.userService.getTypeMenus("2").subscribe((data) => {debugger
            Menu = data;
            this.menuService.structuredMenu(Menu).then((structMenu)=>{debugger

              this.menuService.saveMenusItems(structMenu);
              const {finalMenus, sidebarMenus} = structMenu;
              if (structMenu.finalMenus[0].ROLENAME != "Merchant") {
                this.alertService.errorAlert({
                  title: "No Access! Contact Administrator",
                  backdrop: true,
                  toast: true,
                  timer: 2000, position: 'top-end'
                })
                this.authService.logout();
    
    
              }
              sidebarMenus.forEach((m: any) => {
                this.menuItems.push({
                  ...m,
                  label: m.title || m.label,
                  isTitle: true
                });
                console.log(":::",m)
                this.menuItems.push(m);
              })
    console.log(this.menuItems)
              router.events.forEach((event) => {
                if (event instanceof NavigationEnd) {
    
                  /**
                   * Activating the current active item dropdown
                   */
                  this._activateMenuDropdown();
    
                  /**
                   * closing the sidebar
                   */
                  if (window.matchMedia('(max-width: 991px)').matches) {
                    this.document.body.classList.remove('sidebar-open');
                  }
    
                }
              });
              this._activateMenuDropdown();
              // console.log(this.menuItems, "===++++++++++++===>")
              this.onSidebarThemeChange('')
              /**
               * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
               */
              const desktopMedium = window.matchMedia('(min-width:992px) and (max-width: 1199px)');
              desktopMedium.addEventListener('change', () => {
                this.iconSidebar;
              });
              this.iconSidebar(desktopMedium);
            });
    
          })
        }else{
          Menu = data.Menu;
          this.menuService.structuredMenu(Menu).then((structMenu)=>{debugger

            this.menuService.saveMenusItems(structMenu);
            const {finalMenus, sidebarMenus} = structMenu;
            if (structMenu.finalMenus[0].ROLENAME != "Merchant") {
              this.alertService.errorAlert({
                title: "No Access! Contact Administrator",
                backdrop: true,
                toast: true,
                timer: 2000, position: 'top-end'
              })
              this.authService.logout();
  
  
            }
            sidebarMenus.forEach((m: any) => {
              this.menuItems.push({
                ...m,
                label: m.title || m.label,
                isTitle: true
              });
              console.log(":::",m)
              this.menuItems.push(m);
            })
  console.log(this.menuItems)
            router.events.forEach((event) => {
              if (event instanceof NavigationEnd) {
  
                /**
                 * Activating the current active item dropdown
                 */
                this._activateMenuDropdown();
  
                /**
                 * closing the sidebar
                 */
                if (window.matchMedia('(max-width: 991px)').matches) {
                  this.document.body.classList.remove('sidebar-open');
                }
  
              }
            });
            this._activateMenuDropdown();
            // console.log(this.menuItems, "===++++++++++++===>")
            this.onSidebarThemeChange('')
            /**
             * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
             */
            const desktopMedium = window.matchMedia('(min-width:992px) and (max-width: 1199px)');
            desktopMedium.addEventListener('change', () => {
              this.iconSidebar;
            });
            this.iconSidebar(desktopMedium);
          });
  
        }
        
     
      })
    } catch (err) {

      router.navigate(['/auth/login'], {});
    }


  }

  async ngOnInit(): Promise<void> {
    const username = this.storageService.getUserName()
    const merchantDetails$ = this.merchantService.getMerchant(username);
    this.merchantDetails = await lastValueFrom(merchantDetails$);
    this.printpath('', this.router.config);
    this.sideNavService.sideNavToggleSubject.subscribe(() => {
      // console.log("-------Side Toggle call");
      let event = new MouseEvent('click', {bubbles: true});
      // this.toggleSidebar(event);
    });
    this.sideNavService.toggelEvent$.subscribe(($event) => {
      // console.log("-------EVent Side Toggle call");
      let event = new MouseEvent('click', {bubbles: true});
      // this.toggleSidebar($event);
    });

    // this.userService.getUserProfile().subscribe((data)=>{
    //   const {Menu} = data;
    //   // this.menuItems = Menu
    //   console.log("Menus---->", (Menu));
    //   console.log("Menus---->", Object.keys(Menu));
    //   Object.keys(Menu).forEach((key)=>{
    //     let temp:any = {
    //       label: key,
    //     }
    //     this.menuItems.push({...temp, isTitle: true});
    //
    //     temp['icon']='home'
    //     temp['subItems']= Menu[key].map((sm:any)=>{
    //       return {
    //         label: sm.submenu,
    //         link: sm.link,
    //       }
    //     });
    //     this.menuItems.push(temp);
    //
    //   })
    //   new MetisMenu(this.sidebarMenu.nativeElement,{
    //     toggle: false
    //   });
    this._activateMenuDropdown();
    //   console.log(this.menuItems, "===++++++++++++===>")
    //   this.onSidebarThemeChange('')
    //   /**
    //    * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
    //    */
    //   const desktopMedium = window.matchMedia('(min-width:992px) and (max-width: 1199px)');
    //   desktopMedium.addEventListener('change', () => {
    //     this.iconSidebar;
    //   });
    //   this.iconSidebar(desktopMedium);
    // })
    // this.menuItems = MENU;


  }

  printpath(parent: String, config: Route[]) {
    for (let i = 0; i < config.length; i++) {
      const route = config[i];
      // console.log(parent + '/' + route.path);
      if (route.children) {
        const currentPath = route.path ? parent + '/' + route.path : parent;
        this.printpath(currentPath, route.children);
      }
    }
  }

  ngAfterViewInit() {debugger
    this.menuListItems.changes.subscribe(t => {
      // if(this.mm) this.mm.update();
      this.mm = new MetisMenu(this.sidebarMenu.nativeElement);
    });
    // activate menu item
    // new MetisMenu(this.sidebarMenu.nativeElement);

    // this._activateMenuDropdown();
  }

  /**
   * Toggle sidebar on hamburger button click
   */
  // toggleSidebar(e: Event) {
  //   console.log("-------toggleSidebar call");
  //   this.sidebarToggler.nativeElement.classList.toggle('active');
  //   this.sidebarToggler.nativeElement.classList.toggle('not-active');
  //   if (window.matchMedia('(min-width: 992px)').matches) {
  //     e.preventDefault();
  //     this.document.body.classList.toggle('sidebar-folded');
  //   } else if (window.matchMedia('(max-width: 991px)').matches) {
  //     e.preventDefault();
  //     this.document.body.classList.toggle('sidebar-open');
  //   }
  // }


  /**
   * Toggle settings-sidebar
   */
  toggleSettingsSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('settings-open');
  }


  /**
   * Open sidebar when hover (in folded folded state)
   */
  operSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')) {
      this.document.body.classList.add("open-sidebar-folded");
    }
  }


  /**
   * Fold sidebar after mouse leave (in folded state)
   */
  closeSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')) {
      this.document.body.classList.remove("open-sidebar-folded");
    }
  }

  /**
   * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
   */
  iconSidebar(mq: MediaQueryList) {
    if (mq.matches) {
      this.document.body.classList.add('sidebar-folded');
    } else {
      this.document.body.classList.remove('sidebar-folded');
    }
  }
  toggleSidebar(e: Event) {
    console.log("-------toggleSidebar call");
    this.sidebarToggler.nativeElement.classList.toggle('active');
    this.sidebarToggler.nativeElement.classList.toggle('not-active');
    if (window.matchMedia('(min-width: 992px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-folded');
      this.document.body.classList.forEach((className) => {
        if (className =='sidebar-folded') {
           this.ImageShow = true
        }else{
          this.ImageShow = false
        }
      })

    } else if (window.matchMedia('(max-width: 991px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-open');
    }
  }


  /**
   * Switching sidebar light/dark
   */
  onSidebarThemeChange(event: any) {

    this.document.body.classList.remove('sidebar-dark', 'sidebar-light');
    this.document.body.classList.add("sidebar-light");
    console.log((<HTMLInputElement>event.target)?.value)
    this.document.body.classList.remove('settings-open');
  }


  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }


  /**
   * Reset the menus then hilight current active menu item
   */
  _activateMenuDropdown() {
    this.resetMenuItems();
    this.activateMenuItems();
  }


  /**
   * Resets the menus
   */
  resetMenuItems() {

    const links = document.getElementsByClassName('nav-link-ref');

    for (let i = 0; i < links.length; i++) {
      const menuItemEl = links[i];
      menuItemEl.classList.remove('mm-active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.remove('mm-active');
        const parent2El = parentEl.parentElement;

        if (parent2El) {
          parent2El.classList.remove('mm-show');
        }

        const parent3El = parent2El?.parentElement;
        if (parent3El) {
          parent3El.classList.remove('mm-active');

          if (parent3El.classList.contains('side-nav-item')) {
            const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

            if (firstAnchor) {
              firstAnchor.classList.remove('mm-active');
            }
          }

          const parent4El = parent3El.parentElement;
          if (parent4El) {
            parent4El.classList.remove('mm-show');

            const parent5El = parent4El.parentElement;
            if (parent5El) {
              parent5El.classList.remove('mm-active');
            }
          }
        }
      }
    }
  };


  /**
   * Toggles the menu items
   */
  activateMenuItems() {
    const links: any = document.getElementsByClassName('nav-link-ref');
    const path = this.location.path(false);

    let menuItemEl = null;

    for (let i = 0; i < links.length; i++) {
      const linkPath = links[i]['href'].slice(links[i]['href'].indexOf('#') + 1)
      if (path === linkPath) {
        menuItemEl = links[i];
        break;
      }
    }

    if (menuItemEl) {
      menuItemEl.classList.add('mm-active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.add('mm-active');

        const parent2El = parentEl.parentElement;
        if (parent2El) {
          parent2El.classList.add('mm-show');
        }

        const parent3El = parent2El.parentElement;
        if (parent3El) {
          parent3El.classList.add('mm-active');

          if (parent3El.classList.contains('side-nav-item')) {
            const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

            if (firstAnchor) {
              firstAnchor.classList.add('mm-active');
            }
          }

          const parent4El = parent3El.parentElement;
          if (parent4El) {
            parent4El.classList.add('mm-show');

            const parent5El = parent4El.parentElement;
            if (parent5El) {
              parent5El.classList.add('mm-active');
            }
          }
        }
      }
    }
  };


}

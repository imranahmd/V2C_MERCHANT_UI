import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../../../../layout/sidebar/sidebar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {SideNavService} from "../../../../layout/sidebar/side-name.service";
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";

@Component({
  selector: 'app-reseller-creation',
  templateUrl: './reseller-creation.component.html',
  styleUrls: ['./reseller-creation.component.scss']
})
export class ResellerCreationComponent implements OnInit {
  isAsideNavCollapsed: boolean = true;
  isAdd: boolean = true;
  selectedMerchantId: string;
  clickEvent: Event;
  menuItems: any;
  public permissions: any;
  public currentPath: any;
  public nextPath: any;
  public previousPath: any;
  public disableMenu: boolean = true;
  private queryParams: any;

  constructor(
    private router: Router,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    private sidebarComponent: SidebarComponent, private sideNavService: SideNavService) {
  }

  ngOnInit(): void {
    let path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.currentPath = this.location.path().split('?')[0]

    const {finalMenus, sidebarMenus, rawMenus} = this.menuService.getMenusItems();
    if (path.charAt(0) === '#') {
      path = path.split('?')[0].slice(1);
    }
    console.log("path---", path)
    const rawList = rawMenus.find((r: any) => r.MenuLink == path);
    console.log("rawList---", rawList)
    const r = rawMenus.filter((r: any) => r.MenuId == rawList.PMenuId || r.PMenuId == rawList.PMenuId)
    console.log("r---", r)
    this.menuService.structuredMenu(r, rawList.PMenuId).then((structMenu)=>{
      this.menuItems = structMenu?.sidebarMenus

      this.setPreNextPaths();
      this.router.events.subscribe((val) => {
        if (this.location.path() != '') {
          this.currentPath = this.location.path()?.split('?')[0];
        } else {
          this.currentPath = this.location.path()?.split('?')[0]
        }
        this.setPreNextPaths();
      });
      this.route.queryParams
        .subscribe(params => {
            this.queryParams = params;
            this.disableMenu = !params.mid
            if (!params.mid) {
              this.router.navigate([this.menuItems[0].link], {
                queryParams: {...this.queryParams}
              })
            }
            if (params?.action) {
              this.isAdd = (params.action.toLowerCase() == 'add')
            }
          }
        );
    });


  }


  setPreNextPaths() {
    const previousPathIn = this.menuItems.findIndex((f: any) => f.link == this.currentPath) - 1
    this.previousPath = this.menuItems[previousPathIn]?.link
    const nextPathIn = this.menuItems.findIndex((f: any) => f.link == this.currentPath) + 1
    this.nextPath = this.menuItems[nextPathIn]?.link
  }

  previousStep($event: MouseEvent) {
    this.router.navigate([this.previousPath], {
      queryParams: {...this.queryParams}
    })
  }

  nextStep($event: MouseEvent) {
    this.router.navigate([this.nextPath], {
      queryParams: {...this.queryParams}
    })
  }

}

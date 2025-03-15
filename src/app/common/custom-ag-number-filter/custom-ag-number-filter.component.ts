import { Component, OnInit } from '@angular/core';
import {IFilterAngularComp} from "ag-grid-angular";
import {IDoesFilterPassParams, IFilterParams} from "ag-grid-community";

@Component({
  selector: 'app-custom-ag-number-filter',
  templateUrl: './custom-ag-number-filter.component.html',
  styleUrls: ['./custom-ag-number-filter.component.scss']
})
export class CustomAgNumberFilterComponent implements IFilterAngularComp, OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public skills = [
    {
      name: 'Android',
      get filename() {
        return `${this.field}.png`
      },
      field: 'android',
      selected: false
    },
    {
      name: 'CSS',
      get filename() {
        return `${this.field}.png`
      },
      field: 'css',
      selected: false
    },
    {
      name: 'HTML 5',
      get filename() {
        return `${this.field}.png`
      },
      field: 'html5',
      selected: false
    },
    {
      name: 'Mac',
      get filename() {
        return `${this.field}.png`
      },
      field: 'mac',
      selected: false
    },
    {
      name: 'Windows',
      get filename() {
        return `${this.field}.png`
      },
      field: 'windows',
      selected: false
    }
  ];

  private params!: IFilterParams;

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  onSkillChanged($event: any, skill: any) {
    skill.selected = $event.target.checked;
    this.params.filterChangedCallback();
  }

  getModel() {
    return this.skills.reduce((state: any, skill) => {
      state[skill.field] = skill.selected;
      return state;
    }, {})
  }

  setModel(model: any) {
    for (const skill of this.skills) {
      skill.selected = model && model[skill.field] ? model[skill.field].selected : false;
    }
  }

  doesFilterPass(params: IDoesFilterPassParams) {
    const rowSkills = params.data.skills;
    let passed = true;

    for (const skill of this.skills) {
      passed = passed && (skill.selected ? (skill.selected && rowSkills[skill.field]) : true);
    }

    return passed;
  };

  public isFilterActive() {
    return true;
  };

  helloFromSkillsFilter() {
    alert("Hello From The Skills Filter!");
  }
}

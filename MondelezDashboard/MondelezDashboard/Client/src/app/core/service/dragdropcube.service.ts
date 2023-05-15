import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataexplorerService } from './dataexplorer.service';
@Injectable({
  providedIn: 'root'
})
export class DragDropCubeService {
  constructor(public dataexplorerService: DataexplorerService) {

  }
  updateDropdownLabel(val) {
    switch (val) {
      case 'Demographics':
        return [{ 'name': 'Market' },
          { 'name': 'Category' },
          { 'name': 'KPI' },
          { 'name': 'Demo' },
          { 'name': 'Brands' },          
          { 'name': 'Time Period' }, { 'name': 'Segment Filter' },     ]
       
      case 'Segment':
        return [{ 'name': 'Market' },
          { 'name': 'Category' },
          { 'name': 'KPI' },
          { 'name': 'Segment Filter' },
          { 'name': 'Segment' },
          { 'name': 'Brands' },
        { 'name': 'Time Period' },]
      case 'Channel':
        return [{ 'name': 'Market' },
          { 'name': 'Category' },
          { 'name': 'KPI' },
        { 'name': 'Channel' },
          { 'name': 'Brands' },
          { 'name': 'Time Period' }, { 'name': 'Segment Filter' },]
    }
  }
}

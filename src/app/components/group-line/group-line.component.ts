import { Component, Input } from '@angular/core';
import { TGroupsContent } from '../../services/groups-service/groups.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { GroupCardComponent } from '../../shared/group-card/group-card.component';

@Component({
  selector: 'app-group-line',
  standalone: true,
  imports: [
      GroupCardComponent,
      CommonModule
    ],
  templateUrl: './group-line.component.html',
  styleUrl: './group-line.component.scss'
})
export class GroupLineComponent {
  @Input() groupList!: TGroupsContent[]
}

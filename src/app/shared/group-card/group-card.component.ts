import { Component, Input } from '@angular/core';
import { TGroupsContent } from '../../services/groups-service/groups.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.scss'
})
export class GroupCardComponent {
  @Input() groupItem!: TGroupsContent

}

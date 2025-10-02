import { Component } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    LayoutPageComponent
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

}

import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  private breadCrumbs = inject(BreadCrumbsService);

  public information = {
    address: [
      {
        title: 'Офис, склад в Красноярске',
        description: [
          '630007, г. Новосибирск, пер. Пристанский, 2',
          '+7 (383) 263-20-99',
          'nsk@teplo-sib.ru'
        ]
      },
      {
        title: 'Офис в Красноярске',
        description: [
          '630007, г. Новосибирск, пер. Пристанский, 2',
          '+7 (383) 263-20-99',
          'nsk@teplo-sib.ru'
        ]
      },
      {
        title: 'Время работы',
        description: [
          'ПН-ЧТ: с 9.00 до 18.00',
          '+7 (383) 263-20-99',
          'ПТ: с 9.00 до 17.00'
        ]
      },
    ],
    requisite: [
      {
        title: 'Реквизиты',
        value: 'ООО "Теплоизоляция Новосибирск"'
      },
      {
        title: 'Генеральный директор:',
        value: 'Мезенцев Александр Владимирович"'
      },
      {
        title: 'Юридический адрес:',
        value: '630007, г. Новосибирск, пер. Пристанский, 2'
      },
      {
        title: 'Фактический адрес:',
        value: '630007, г. Новосибирск, пер. Пристанский, 2"'
      },
      {
        title: 'Почтовый адрес:',
        value: '630007, г. Новосибирск, а/я 88"'
      },
      {
        title: 'Р/с',
        value: '40702810108000001296'
      },
      {
        title: 'К/с',
        value: '30101810500000000641'
      },
      {
        title: 'БИК / КПП',
        value: '045004850 / 540601001'
      },
    ],
  }
}

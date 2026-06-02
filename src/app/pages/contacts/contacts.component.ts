import { Component, inject, OnInit } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { RequestService } from '../../services/request/request.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactsService } from '../../services/contacts/contacts.service';
import { HtmlContentsService } from '../../services/html-contents/html-contents.service';
import { AsyncPipe } from '@angular/common';
import { SafeHtmlPipe } from '../../services/pipes/safe-html/safe-html.pipe';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    SafeHtmlPipe
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  private breadCrumbs = inject(BreadCrumbsService);
  private contactsService = inject(ContactsService);
  private htmlContentsService = inject(HtmlContentsService);
  private breadCrumbsService = inject(BreadCrumbsService);

  public htmlContent$ =  this.htmlContentsService.getHtmlContent$();
  
  constructor(private title: Title, private meta: Meta) {
      this.title.setTitle('Контакты | Новатех - Производство теплоизоляции');
      this.meta.addTags([
        { name: 'description', content: 'Свяжитесь с компанией Новатех. Наши контакты: телефон отдела продаж, email для заказов, адрес производства. Получите консультацию по выбору теплоизоляции, рассчитайте стоимость заказа, узнайте условия доставки по России.' },
        { name: 'keywords', content: 'контакты теплоизоляция, телефон утеплитель, адрес производителя, связаться с новатех, консультация теплоизоляция' },
        { property: 'og:title', content: 'Контакты - Новатех' },
        { property: 'og:description', content: 'Свяжитесь с нами для консультации, заказа и доставки теплоизоляции по всей России.' },
        { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
        { property: 'og:url', content: 'https://nvt24.ru/contacts' },
        { property: 'og:type', content: 'website' },
      ]);
    }

ngOnInit(): void {
  this.breadCrumbsService.setBreadcrumbs([
    { label: 'Главная', url: '/', isClickable: true },
    { label: 'Контакты', url: '', isClickable: false },
  ]);
  

  this.contactsService.getContacts$().subscribe({
    next: (htmlString) => {      
      // Варианты обработки HTML:
      
      // 1. Парсинг через DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const contacts = doc.querySelectorAll('.contact-item');
      
      // 2. Создание временного элемента
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      const contactsData = tempDiv.querySelectorAll('.contact');
      
      // 3. Извлечение данных через регулярные выражения
      const pattern = /<div class="contact-name">(.*?)<\/div>/g;
      const matches = [...htmlString.matchAll(pattern)];
      
    },
    error: (error) => {
      console.error('Error loading HTML:', error);
    }
  });
}
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

    private requestService = inject(RequestService);
  
    public formData = {
      name: '',
      phone: '',
      email: '',
      message: '',
      consent: false
    };
  
  
    onSubmit() {
      this.requestService.sendRequest(this.formData).subscribe({
        complete: () => {
          this.showSuccessMessage = true;

          this.formData = {
            name: '',
            phone: '',
            email: '',
            message: '',
            consent: false
          };

          setTimeout(() => {
            this.closeSuccessMessage();
          }, 5000);
        }
      })
    }

    showSuccessMessage: boolean = false;

    closeSuccessMessage(): void {
      this.showSuccessMessage = false;
    }
}

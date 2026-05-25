import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AboutComponent } from './pages/about/about.component';
import { NewsComponent } from './pages/news/news.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';
import { ProducerProductsComponent } from './pages/producer-products/producer-products.component';
import { GroupPageComponent } from './pages/group-page/group-page.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { NewsDetailComponent } from './pages/news-detail/news-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lambda/welcome',
    pathMatch: 'full'
  },
  {
    path: 'lambda',
    component: MainPageComponent,
    data: { breadcrumb: 'Главная' },
    children: [
        {
            path: '',
            redirectTo: 'welcome',
            pathMatch: 'full'
        },
      {
        path: 'about',
        component: AboutComponent,
        data: { breadcrumb: 'О компании' }
      },
      {
        path: 'news',
        component: NewsComponent,
        data: { breadcrumb: 'Новости' }
      },
      {
        path: 'news/:id',
        component: NewsDetailComponent,
        data: { breadcrumb: 'Новость' },
      },
      {
        path: 'contacts',
        component: ContactsComponent,
        data: { breadcrumb: 'Контакты' }
      },
      {
        path: 'certificates',
        component: CertificatesComponent,
        data: { breadcrumb: 'Сертификаты' }
      },
      {
        path: 'catalog',
        component: CatalogComponent,
        data: { breadcrumb: 'Каталог' }
      },
      {
        path: 'welcome',
        component: WelcomeComponent,
        data: { breadcrumb: 'Добро пожаловать' }
      },
      {
        path: 'shopping-cart',
        component: ShoppingCartComponent,
        data: { breadcrumb: 'Корзина' }
      },
      {
        path: 'product/:id',
        component: DetailsPageComponent,
        data: { breadcrumb: 'Товар' }
      },
      {
        path: 'producer/:slug',
        component: ProducerProductsComponent,
        data: { breadcrumb: 'Производитель' }
      },
      {
        path: 'group/:slug',
        component: GroupPageComponent,
        data: { breadcrumb: 'Группа' }
      }
    ]
  },

    {
        path: '**',
        redirectTo: 'page-not-found',
    },
    {
        path: 'page-not-found',
        component: MainPageComponent,
    }
];

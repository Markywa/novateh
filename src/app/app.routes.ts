import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AboutComponent } from './pages/about/about.component';
import { NewsComponent } from './pages/news/news.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';
import { ProducerProductsComponent } from './pages/producer-products/producer-products.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'main/catalog',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MainPageComponent,
        children: [
            {
                path: 'about',
                component: AboutComponent,
            },
            {
                path: 'news',
                component: NewsComponent,
            },
            {
                path: 'contacts',
                component: ContactsComponent,
            },
            {
                path: 'certificates',
                component: CertificatesComponent,
            },
            {
                path: 'catalog',
                component: CatalogComponent,
            },
            {
                path: 'product/:id',
                component: DetailsPageComponent,
            },
            {
                path: 'producer/:id',
                component: ProducerProductsComponent,
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

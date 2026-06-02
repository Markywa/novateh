import { Component, inject, OnInit } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { CertsService } from '../../services/certs/certs.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url/safe-url.pipe';
import { environment } from '../../../environments/environment';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { finalize } from 'rxjs/operators';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

interface Certificate {
  id: number;
  title: string;
  storage_path: string;
  url: string;
  mime_type: string;
  file_kind: string;
  size_bytes: number;
  sort_order: number;
}

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent,
    CommonModule,
    SafeUrlPipe,
    LoaderComponent
  ],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent implements OnInit {
  private certsService = inject(CertsService);
  private sanitizer = inject(DomSanitizer);
  private breadCrumbsService = inject(BreadCrumbsService);

  constructor(private title: Title, private meta: Meta) {
      this.title.setTitle('Сертификаты и лицензии | Новатех');
      this.meta.addTags([
        { name: 'description', content: 'Сертификаты качества на всю продукцию Новатех. Наши теплоизоляционные материалы соответствуют ГОСТ и международным стандартам. Лицензии, разрешительная документация, протоколы испытаний. Мы гарантируем качество каждого изделия.' },
        { name: 'keywords', content: 'сертификаты теплоизоляции, лицензии, ГОСТ утеплитель, качество теплоизоляции, сертификат соответствия' },
        { property: 'og:title', content: 'Сертификаты и лицензии - Новатех' },
        { property: 'og:description', content: 'Сертификаты качества на теплоизоляционные материалы. Соответствие ГОСТ и международным стандартам.' },
        { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
        { property: 'og:url', content: 'https://nvt24.ru/certificates' },
        { property: 'og:type', content: 'website' },
      ]);
    }

  certificates: Certificate[] = [];
  showModal = false;
  selectedCert: Certificate | null = null;
  environment = environment;
  
  // Переменная для отслеживания загрузки
  isLoading = false;
  isDownloading = false; // Отдельно для отслеживания загрузки файлов

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Сертификаты', url: '', isClickable: false },
    ]);
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.certsService.getCerts$().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (res: Certificate[]) => {
        this.certificates = res;
      },
      error: (error) => {
        console.error('Ошибка при загрузке сертификатов:', error);
        this.isLoading = false;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Байт';
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF документ';
    if (mimeType.includes('image')) return 'Изображение';
    if (mimeType.includes('word')) return 'Word документ';
    if (mimeType.includes('excel')) return 'Excel документ';
    return 'Документ';
  }

  getFileName(cert: Certificate): string {
    const urlParts = cert.url.split('/');
    const originalFileName = urlParts[urlParts.length - 1];
    
    if (originalFileName.includes('.')) {
      return originalFileName;
    }
    return `${cert.title.replace(/[^a-zа-яё0-9]/gi, '_')}.pdf`;
  }

  isPreviewable(mimeType: string): boolean {
    return mimeType === 'application/pdf' || mimeType.startsWith('image/');
  }

  previewFile(cert: Certificate): void {
    this.selectedCert = cert;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCert = null;
  }

  downloadFile(cert: Certificate): void {
    this.isDownloading = true;
    const url = `${environment.baseUrl}${cert.url}`;
    const fileName = this.getFileName(cert);
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
        this.isDownloading = false;
      })
      .catch(error => {
        console.error('Ошибка при загрузке файла:', error);
        window.open(url, '_blank');
        this.isDownloading = false;
      });
  }
}
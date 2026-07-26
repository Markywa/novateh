import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, PLATFORM_ID, OnDestroy, ElementRef, ViewChild, signal, afterRender } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContactsService } from '../../services/contacts/contacts.service';

const DEFAULT_COORDINATES = [92.86090366, 55.98028477];

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  private contactService = inject(ContactsService);
  private platformId = inject(PLATFORM_ID);
  
  private mapInstance: any = null;
  private vectorLayerInstance: any = null;
  private markerFeature: any = null;
  private isMapInitialized = false;
  private resizeHandler: (() => void) | null = null;
  
  public isBrowser = signal(false);
  public mapReady = signal(false);
  public currentCoordinates = signal<[number, number]>([0, 0]);

  public linkArr: {name: string, link: string}[] = [
    { name: 'ГЛАВНАЯ', link: '/welcome' },
    { name: 'КАТАЛОГ', link: '/catalog' },
    { name: 'О КОМПАНИИ', link: '/about' },
    { name: 'СЕРТИФИКАТЫ', link: '/certificates' },
    { name: 'НОВОСТИ', link: '/news' },
    { name: 'КОНТАКТЫ', link: '/contacts' },
  ];

  public zoomLevel: number = 13;
  contact$ = this.contactService.getContacts$();

  constructor() {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    
    // Используем afterRender для инициализации на клиенте
    afterRender(() => {
      if (this.isBrowser() && !this.isMapInitialized) {
        this.initMap();
      }
    });
  }

  private async initMap(): Promise<void> {
    try {
      // Проверяем, что контейнер существует
      const container = this.mapContainer?.nativeElement;
      if (!container) {
        console.error('Map container not found');
        return;
      }

      // Подписка на контакты
      this.contact$.subscribe((res) => {
        if (res && res.longitude && res.latitude) {
          this.currentCoordinates.set([res.longitude, res.latitude]);
          
          if (!this.isMapInitialized) {
            this.createMap(res);
          } else {
            this.updateMapPosition([res.longitude, res.latitude]);
          }
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async createMap(contactData: any): Promise<void> {
    try {
      const container = this.mapContainer?.nativeElement;
      if (!container) return;

      // Динамический импорт OpenLayers
      const ol = await import('ol');
      const View = (await import('ol/View')).default;
      const TileLayer = (await import('ol/layer/Tile')).default;
      const XYZ = (await import('ol/source/XYZ')).default;
      const VectorLayer = (await import('ol/layer/Vector')).default;
      const VectorSource = (await import('ol/source/Vector')).default;
      const Feature = (await import('ol/Feature')).default;
      const Point = (await import('ol/geom/Point')).default;
      const Style = (await import('ol/style/Style')).default;
      const Icon = (await import('ol/style/Icon')).default;
      const Overlay = (await import('ol/Overlay')).default;
      const proj = await import('ol/proj');

      // Используем географические координаты
      if (proj && typeof proj.useGeographic === 'function') {
        proj.useGeographic();
      }

      const coordinates: any[] = contactData.longitude && contactData.latitude 
        ? [contactData.longitude, contactData.latitude] 
        : DEFAULT_COORDINATES;

      // Создаем элемент для попапа
      let popupElement = document.getElementById('popup');
      if (!popupElement) {
        popupElement = document.createElement('div');
        popupElement.id = 'popup';
        popupElement.style.display = 'none';
        document.body.appendChild(popupElement);
      }

      // Создаем карту
      const map = new ol.Map({
        target: container,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
          center: coordinates,
          zoom: this.zoomLevel
        }),
        controls: [],
        overlays: [
          new Overlay({
            element: popupElement,
            positioning: 'bottom-center',
            stopEvent: false
          })
        ]
      });

      // Создаем маркер
      const marker = new Feature({
        geometry: new Point(coordinates)
      });

      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/images/marker.svg',
          width: 50,
          height: 50
        })
      });
      marker.setStyle(markerStyle);

      // Создаем векторный слой
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [marker]
        })
      });

      map.addLayer(vectorLayer);

      // Сохраняем ссылки
      this.mapInstance = map;
      this.vectorLayerInstance = vectorLayer;
      this.markerFeature = marker;
      this.isMapInitialized = true;
      this.mapReady.set(true);

      // Обновляем позицию с учетом размера экрана
      setTimeout(() => {
        this.updateMapPosition(coordinates);
      }, 200);

      // Обработчик изменения размера окна
      this.resizeHandler = () => {
        const coords = this.currentCoordinates();
        if (coords[0] !== 0 && coords[1] !== 0) {
          this.updateMapPosition(coords);
        }
      };
      window.addEventListener('resize', this.resizeHandler);

    } catch (error) {
      console.error('Error creating map:', error);
    }
  }

  private updateMapPosition(coordinates: any[]): void {
    if (!this.mapInstance) return;

    try {
      const view = this.mapInstance.getView();
      if (!view) return;

      let adjustedCoords = [...coordinates] as [number, number];
      
      // Корректировка для мобильных устройств
      if (window.innerWidth < 600) {
        adjustedCoords = [coordinates[0], coordinates[1] + 0.02];
      }

      view.setCenter(adjustedCoords);
      
      // Обновляем позицию маркера
      if (this.markerFeature) {
        const geometry = this.markerFeature.getGeometry();
        if (geometry && typeof geometry.setCoordinates === 'function') {
          geometry.setCoordinates(adjustedCoords);
        }
      }

      this.currentCoordinates.set(adjustedCoords);
    } catch (error) {
      console.error('Error updating map position:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.mapInstance) {
      try {
        this.mapInstance.dispose();
      } catch (error) {
        console.error('Error disposing map:', error);
      }
    }

    if(this.isBrowser()){
      const popup = document.getElementById('popup');
      if (popup) {
        popup.remove();
      }

      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
      }
    }

  }
}
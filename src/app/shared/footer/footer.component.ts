import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, PLATFORM_ID, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContactsService } from '../../services/contacts/contacts.service';
import { shareReplay, Subscription } from 'rxjs';

const DEFAULT_COORDINATES: [number, number] = [92.86090366, 55.98028477];

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
export class FooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  private contactService = inject(ContactsService);
  private platformId = inject(PLATFORM_ID);
  
  private mapInstance: any = null;
  private vectorLayerInstance: any = null;
  private markerFeature: any = null;
  private fromLonLat: ((coordinate: number[]) => number[]) | null = null;
  private isMapInitialized = false;
  private isMapStarting = false;
  private resizeHandler: (() => void) | null = null;
  private contactSubscription?: Subscription;
  
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
  contact$ = this.contactService.getContacts$().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      void this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    if (this.isMapStarting || this.isMapInitialized) return;

    try {
      const container = this.mapContainer?.nativeElement;
      if (!container) {
        console.warn('Map container not found');
        return;
      }

      this.isMapStarting = true;
      this.contactSubscription = this.contact$.subscribe({
        next: (res) => {
          const longitude = Number(res?.longitude);
          const latitude = Number(res?.latitude);
          const coordinates: [number, number] =
            Number.isFinite(longitude) && Number.isFinite(latitude)
              ? [longitude, latitude]
              : [...DEFAULT_COORDINATES];

          this.currentCoordinates.set(coordinates);

          if (!this.isMapInitialized) {
            void this.createMap({ ...res, longitude: coordinates[0], latitude: coordinates[1] });
          } else {
            this.updateMapPosition(coordinates);
          }
        },
        error: (error) => {
          this.isMapStarting = false;
          console.error('Error loading contacts for map:', error);
        }
      });

    } catch (error) {
      this.isMapStarting = false;
      console.error('Error initializing map:', error);
    }
  }

  private async createMap(contactData: any): Promise<void> {
    try {
      const container = this.mapContainer?.nativeElement;
      if (!container) {
        this.isMapStarting = false;
        return;
      }

      const Map = (await import('ol/Map')).default;
      const View = (await import('ol/View')).default;
      const TileLayer = (await import('ol/layer/Tile')).default;
      const OSM = (await import('ol/source/OSM')).default;
      const VectorLayer = (await import('ol/layer/Vector')).default;
      const VectorSource = (await import('ol/source/Vector')).default;
      const Feature = (await import('ol/Feature')).default;
      const Point = (await import('ol/geom/Point')).default;
      const Style = (await import('ol/style/Style')).default;
      const Icon = (await import('ol/style/Icon')).default;
      const Overlay = (await import('ol/Overlay')).default;
      const proj = await import('ol/proj');
      this.fromLonLat = proj.fromLonLat;

      const coordinates: [number, number] = contactData.longitude && contactData.latitude
        ? [contactData.longitude, contactData.latitude] 
        : [...DEFAULT_COORDINATES];
      const projectedCoordinates = this.projectCoordinates(coordinates);

      // Создаем элемент для попапа
      let popupElement = document.getElementById('popup');
      if (!popupElement) {
        popupElement = document.createElement('div');
        popupElement.id = 'popup';
        popupElement.style.display = 'none';
        document.body.appendChild(popupElement);
      }

      // Создаем карту
      const map = new Map({
        target: container,
        layers: [
          new TileLayer({
            source: new OSM({ crossOrigin: 'anonymous' })
          })
        ],
        view: new View({
          center: projectedCoordinates,
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
        geometry: new Point(projectedCoordinates)
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
      this.isMapStarting = false;
      this.mapReady.set(true);

      // Обновляем позицию с учетом размера экрана
      setTimeout(() => {
        map.updateSize();
        map.renderSync();
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
      this.isMapStarting = false;
      console.error('Error creating map:', error);
    }
  }

  private updateMapPosition(coordinates: [number, number]): void {
    if (!this.mapInstance) return;

    try {
      this.mapInstance.updateSize();
      const view = this.mapInstance.getView();
      if (!view) return;

      const projectedCoordinates = this.projectCoordinates(coordinates);

      // Keep the feature at its real coordinates; only move the viewport so
      // the mobile contacts card does not cover the marker.
      if (this.markerFeature) {
        const geometry = this.markerFeature.getGeometry();
        if (geometry && typeof geometry.setCoordinates === 'function') {
          geometry.setCoordinates(projectedCoordinates);
        }
      }

      const mapSize = this.mapInstance.getSize();
      if (!mapSize) {
        view.setCenter(projectedCoordinates);
        return;
      }

      const markerPixel: [number, number] = mapSize[0] < 600
        ? [mapSize[0] / 2, mapSize[1] * 0.75]
        : [mapSize[0] / 2, mapSize[1] / 2];
      view.centerOn(projectedCoordinates, mapSize, markerPixel);
    } catch (error) {
      console.error('Error updating map position:', error);
    }
  }

  private projectCoordinates(coordinates: number[]): number[] {
    return this.fromLonLat ? this.fromLonLat(coordinates) : coordinates;
  }

  ngOnDestroy(): void {
    if (this.mapInstance) {
      try {
        this.mapInstance.dispose();
      } catch (error) {
        console.error('Error disposing map:', error);
      }
    }

    this.contactSubscription?.unsubscribe();

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

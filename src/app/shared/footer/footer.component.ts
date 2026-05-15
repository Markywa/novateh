import { AsyncPipe, CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Feature, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import * as proj  from 'ol/proj'
import { XYZ } from 'ol/source';
import { defaults as defaultInteractions } from 'ol/interaction';
import { Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Map from 'ol/Map';
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
export class FooterComponent implements AfterViewInit{
  private contactService = inject(ContactsService);
  public linkArr: {name: string, link: string}[] = [
    {
      name: 'ГЛАВНАЯ',
      link: '/main/welcome'
    },
    {
      name: 'КАТАЛОГ',
      link: '/main/catalog'
    },
    {
      name: 'О КОМПАНИИ',
      link: '/main/about'
    },
    {
      name: 'СЕРТИФИКАТЫ',
      link: '/main/certificates'
    },
    {
      name: 'НОВОСТИ',
      link: '/main/news'
    },
    {
      name: 'КОНТАКТЫ',
      link: '/main/contacts'
    },
  ]

  public map = new Map();
  public zoomLevel: number = 13;
  public maxZoomLevel: number = 18;
  public minZoomLevel: number = 14;

  contact$ = this.contactService.getContacts$();

  ngAfterViewInit(): void {
    this.initializeMap();

    
  }

    public initializeMap(): void {
      proj.useGeographic() 
      this.contact$.subscribe((res) => {
          this.map = new Map({
          target: 'map',
          layers: [
            new TileLayer({
              source: new XYZ({
                url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
              })
            })
          ],
          view: new View({
            center: res.longitude ? [res.longitude, res.latitude] : DEFAULT_COORDINATES,
            zoom: this.zoomLevel
          }),
          controls: [],
          overlays: [
            new Overlay({
              element: document.getElementById('popup') as HTMLElement, // Ссылка на DOM-элемент для попапа
              positioning: 'bottom-center', // Позиционирование попапа
              stopEvent: false // Позволяет событиям проходить через попап
            })
          ],
          interactions: defaultInteractions({
            dragPan: false, 
            mouseWheelZoom: false
          }).extend([]) 
        });      

        const marker = new Feature({
          geometry: new Point([res.longitude, res.latitude])  // Координаты маркера
        });
    
        // Опционально: устанавливаем стиль маркера
        const markerStyle = new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'assets/images/marker.svg',  // Путь к иконке маркера
            width: 50,
            height: 50
          })
        });
        marker.setStyle(markerStyle);
    
        // Создаем векторный слой и добавляем маркер на карту
        const vectorLayer = new VectorLayer({
          source: new VectorSource({
            features: [marker]
          })
        });
        this.map.addLayer(vectorLayer);
      })

    }
}

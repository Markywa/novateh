import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TBrandsContent } from '../../services/brands-service/brands.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

export type ProducerAppearance = 'logo' | 'text';

@Component({
  selector: 'app-producer',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
],
  templateUrl: './producer.component.html',
  styleUrl: './producer.component.scss'
})
export class ProducerComponent {
  @Input() producerItem!: TBrandsContent;
  @Input() appearance: ProducerAppearance = 'logo';
  failedLogoUrl: string | null = null;

  get logoUrl(): string | null {
    const media = this.producerItem?.media?.trim();
    if (!media) return null;
    if (/^https?:\/\//i.test(media)) return media;
    if (media.startsWith('/') && !media.startsWith('//')) return environment.baseUrl + media;
    return null;
  }
}

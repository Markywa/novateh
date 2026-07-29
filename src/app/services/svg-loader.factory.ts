import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { SvgHttpLoader, SvgLoader } from 'angular-svg-icon';
import { Observable, of } from 'rxjs';

class ServerSvgLoader extends SvgLoader {
  getSvg(): Observable<string> {
    return of('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  }
}

export const svgLoaderProvider = {
  provide: SvgLoader,
  deps: [HttpClient, PLATFORM_ID],
  useFactory: (http: HttpClient, platformId: Object): SvgLoader => {
    if (isPlatformServer(platformId)) {
      return new ServerSvgLoader();
    }

    return new SvgHttpLoader(http);
  },
};

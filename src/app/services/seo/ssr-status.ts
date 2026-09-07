import { InjectionToken } from '@angular/core';

// Only Express supplies this callback; it is optional in the browser.
export const SSR_STATUS = new InjectionToken<(status: number) => void>('SSR_STATUS');

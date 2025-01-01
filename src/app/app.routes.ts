import { Routes } from '@angular/router';
import { ArtistComponent } from '../app/pages/artist/artist.component';

export const routes: Routes = [
  { path: 'artists', component: ArtistComponent },
  { path: '', redirectTo: '/artists', pathMatch: 'full' }
];

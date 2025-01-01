import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ArtistDto } from '../dto/artistDto';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getArtists(): Observable<ArtistDto[]> {
    return this.http.get<ArtistDto[]>(`${this.baseUrl}/api/artists`);
  }

  getArtistById(id: string): Observable<ArtistDto> {
    return this.http.get<ArtistDto>(`${this.baseUrl}/api/artists/${id}`);
  }

  createArtist(artistData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/artists`, artistData);
  }

  updateArtist(id: string, artist: FormData): Observable<any> {
    console.log('Updating artist with ID:', id);
    console.log('Artist data:', artist);
    return this.http.put(`${this.baseUrl}/api/artists/${id}`, artist, { responseType: 'text' });
  }

  deleteArtist(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/api/artists/${id}`, { responseType: 'text' });
  }

  rateArtist(id: string, rating: number): Observable<ArtistDto> {
    return this.http.post<ArtistDto>(`${this.baseUrl}/api/artists/${id}/rate`, { rating });
  }
}

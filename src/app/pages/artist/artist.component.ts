import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ArtistService } from '../../services/artist.service';
import { ArtistDto } from '../../dto/artistDto';

@Component({
  selector: 'app-artist',
  standalone: true,
  templateUrl: './artist.component.html',
  imports: [ReactiveFormsModule, NgIf, NgFor]
})
export class ArtistComponent implements OnInit {
  artists: ArtistDto[] = [];
  artistForm: FormGroup;
  selectedArtist: ArtistDto | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  viewMode: boolean = false;

  private fb = inject(FormBuilder);
  private artistService = inject(ArtistService);

  constructor() {
    this.artistForm = this.fb.group({
      artistName: ['', Validators.required],
      stageName: [''],
      numberOfAlbums: [0],
      artistImage: [''],
      careerStartDate: ['', Validators.required],
      socialMediaLinks: [''],
      recordLabel: [''],
      publishingHouse: [''],
      rating: [0]
    });
  }

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.artistService.getArtists().subscribe(
      (data: ArtistDto[]) => {
        this.artists = data;
      },
      (error) => {
        this.displayErrorMessage(error.message || 'Error loading artists');
      }
    );
  }

  openCreateArtistForm(): void {
    this.artistForm.reset();
    this.selectedArtist = null;
    this.viewMode = false;
  }

  openEditArtistForm(artist: ArtistDto): void {
    this.selectedArtist = artist;
    this.artistForm.patchValue(artist);
    this.viewMode = false;
  }

  viewArtist(artist: ArtistDto): void {
    this.selectedArtist = artist;
    this.artistForm.patchValue(artist);
    this.viewMode = true;
  }

  closeCreateArtistForm(): void {
    this.artistForm.reset();
    this.selectedArtist = null;
    this.viewMode = false;
  }

  onDelete(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this artist?');
    if (confirmed) {
      this.artistService.deleteArtist(id).subscribe(
        (response) => {
          this.loadArtists();
          this.displaySuccessMessage(response || 'Artist deleted successfully');
        },
        (error) => {
          this.displayErrorMessage(this.extractErrorMessage(error) || 'Error deleting artist');
        }
      );
    }
  }

  onSubmit(): void {
    if (this.artistForm.invalid) {
      return;
    }

    const formData: FormData = new FormData();
    Object.keys(this.artistForm.value).forEach(key => {
      const value = this.artistForm.get(key)?.value;
      if (key === 'artistImage') {
        const imageInput = document.getElementById('artistImage') as HTMLInputElement;
        if (imageInput && imageInput.files && imageInput.files.length > 0) {
          formData.append(key, imageInput.files[0]);
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    console.log('Form data:', formData);

    if (this.selectedArtist && this.selectedArtist.id) {
      console.log('Updating artist with ID:', this.selectedArtist.id);
      this.artistService.updateArtist(this.selectedArtist.id, formData).subscribe(
        (response) => {
          console.log('Update response:', response);
          this.loadArtists();
          this.displaySuccessMessage(response || 'Artist updated successfully');
        },
        (error) => {
          console.log('Update error:', error);
          this.displayErrorMessage(this.extractErrorMessage(error) || 'Error updating artist');
        }
      );
    } else {
      console.log('Creating new artist');
      this.artistService.createArtist(formData).subscribe(
        (response) => {
          console.log('Create response:', response);
          this.loadArtists();
          this.displaySuccessMessage(response || 'Artist created successfully');
        },
        (error) => {
          console.log('Create error:', error);
          this.displayErrorMessage(this.extractErrorMessage(error) || 'Error creating artist');
        }
      );
    }

    this.artistForm.reset();
    this.selectedArtist = null;
    this.viewMode = false;
  }

  displaySuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  displayErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }

  extractErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'object') {
      return Object.values(error.error).join(', ');
    }
    return error.message || 'An unknown error occurred';
  }

  get paginatedArtists(): ArtistDto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.artists.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.artists.length / this.itemsPerPage);
  }

  get pagesArray(): any[] {
    return new Array(this.totalPages);
  }
}
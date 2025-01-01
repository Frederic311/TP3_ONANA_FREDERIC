import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../../services/artist.service';
import { ArtistDto } from '../../dto/artistDto';
import { NgForm } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe]
})
export class ArtistComponent implements OnInit {
  artists: ArtistDto[] = [];
  pagedArtists: ArtistDto[] = [];
  selectedArtist: ArtistDto = {
    artistImage: '',
    artistName: '',
    stageName: '',
    numberOfAlbums: 0,
    socialMediaLinks: [],
    recordLabel: '',
    publishingHouse: '',
    careerStartDate: '',
    rating: 0,
  };
  validationErrors: { [key: string]: string } = {};
  generalError: string = '';
  isCreating = false;
  alertMessage: string = '';
  showAlert = false;
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];

  constructor(private artistService: ArtistService, private datepipe: DatePipe) { }

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists() {
    this.artistService.getArtists().subscribe(
      (artists) => {
        this.artists = artists.map(artist => ({
          ...artist,
          careerStartDate: artist.careerStartDate ? new Date(artist.careerStartDate).toISOString().split('T')[0] : ''
        }));
        this.totalItems = this.artists.length;
        this.calculateTotalPages();
        this.paginateArtists();
      },
      (error) => {
        console.error('Error loading artists:', error);
        this.showAlertMessage('Error loading artists', true);
      }
    );
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  paginateArtists() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.totalItems - 1);
    this.pagedArtists = this.artists.slice(startIndex, endIndex + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateArtists();
    }
  }

  get previousPage() {
    return Math.max(1, this.currentPage - 1);
  }

  get nextPage() {
    return Math.min(this.totalPages, this.currentPage + 1);
  }

  openCreateArtistForm() {
    this.selectedArtist = {
      artistImage: '',
      artistName: '',
      stageName: '',
      numberOfAlbums: 0,
      socialMediaLinks: [],
      recordLabel: '',
      publishingHouse: '',
      careerStartDate: '',
      rating: 0,
    };
    this.isCreating = true;
    this.validationErrors = {};
    this.generalError = '';
  }

  closeCreateArtistForm() {
    this.isCreating = false;
  }

  createOrUpdateArtist(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.selectedArtist.rating === undefined) {
      this.selectedArtist.rating = 0;
  }

    const formData = new FormData();
    (Object.keys(this.selectedArtist) as (keyof ArtistDto)[]).forEach((key) => {
      if (key === 'socialMediaLinks') {
        formData.append(key, (this.selectedArtist[key] as string[]).join(','));
      } else if (key === 'artistImage') {
        const imageInput = document.getElementById('artistImage') as HTMLInputElement;
        if (imageInput.files && imageInput.files.length > 0) {
          formData.append(key, imageInput.files[0]);
        }
      } else if (key === 'careerStartDate') {
        formData.append(key, this.datepipe.transform(this.selectedArtist[key], 'yyyy-MM-dd') || '');
      } else {
        formData.append(key, this.selectedArtist[key] as string);
      }
    });

    const request = this.selectedArtist.id
      ? this.artistService.updateArtist(this.selectedArtist.id, formData)
      : this.artistService.createArtist(formData);

    request.subscribe(
      (response) => {
        this.loadArtists();
        this.showAlertMessage(this.selectedArtist.id ? 'Artist updated successfully!' : 'Artist created successfully!', false);
        this.closeCreateArtistForm();
        form.resetForm();
      },
      (error) => {
        console.error('Error creating/updating artist:', error);
        this.generalError = error.error.message || 'Failed to create/update artist.';
        this.showAlertMessage(this.generalError, true);
      }
    );
  }

  editArtist(artist: ArtistDto) {
    this.selectedArtist = {
      ...artist,
      careerStartDate: artist.careerStartDate ? this.datepipe.transform(artist.careerStartDate, 'yyyy-MM-dd') || '' : '',
    };
    this.isCreating = true;
  }

  viewArtist(artist: ArtistDto) {
    this.selectedArtist = { ...artist };
  }

  deleteArtist(id: string) {
    const confirmDelete = confirm('Are you sure you want to delete this artist?');
    if (confirmDelete) {
      this.artistService.deleteArtist(id).subscribe(
        () => {
          this.loadArtists();
          this.showAlertMessage('Artist deleted successfully!', false);
        },
        (error) => {
          console.error('Error deleting artist:', error);
          this.showAlertMessage('Failed to delete artist.', true);
        }
      );
    }
  }

  showAlertMessage(message: string, isError: boolean) {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 2000);
  }
}
export interface ArtistDto {
    id?: string;
    artistImage: string;
    artistName: string;
    stageName: string;
    numberOfAlbums: number;
    socialMediaLinks: string | string[];
    recordLabel: string;
    publishingHouse: string;
    careerStartDate: string;
    rating: number;
}
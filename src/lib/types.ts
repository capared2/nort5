export interface Persona {
  id: string | null;
  name: string;
}

export interface Interprete extends Persona {
  character: string;
  image: string | null;
}

export interface Imagen {
  url: string;
  caption?: string;
}

export interface Dinero {
  amount: number;
  currency: string;
}

export interface DondeVerla {
  name: string;
  url: string;
}

/** Ficha completa, tal y como la guarda el scraper. */
export interface Pelicula {
  id: string;
  url: string;
  category: string;
  type: string;
  title: string;
  original_title: string;
  genres: string[];
  year: number | null;
  end_year: number | null;
  release_date: string | null;
  runtime_minutes: number | null;
  certificate: string | null;
  /** Media de los críticos, sobre 10. Es la que pinta las estrellas. */
  rating: number | null;
  votes: number | null;
  /** El porcentaje de críticos a los que les gustó. */
  tomatometer: number | null;
  tomatometer_count: number | null;
  tomatometer_certified: boolean;
  /** El porcentaje del público. */
  audience_score: number | null;
  audience_count: number | null;
  metascore: number | null;
  plot: string;
  tagline: string;
  poster: string | null;
  images: Imagen[];
  trailer: string | null;
  directors: Persona[];
  writers: Persona[];
  cast: Interprete[];
  keywords: string[];
  countries: string[];
  languages: string[];
  companies: string[];
  budget: Dinero | null;
  gross_worldwide: Dinero | null;
  streaming: DondeVerla[];
  similar: string[];
  source: string;
  scraped_at: string;
}

/** Version ligera: lo justo para pintar una caratula sin bajarse la ficha. */
export interface Tarjeta {
  id: string;
  category: string;
  type: string;
  title: string;
  original_title: string;
  year: number | null;
  genres: string[];
  rating: number | null;
  votes: number | null;
  tomatometer: number | null;
  audience_score: number | null;
  runtime_minutes: number | null;
  certificate: string | null;
  poster: string | null;
  plot: string;
  directors: (string | null)[];
}

export interface ArchivoParte {
  genre: string;
  part: number;
  count: number;
  updated_at: string;
  titles: Pelicula[];
}

export interface EntradaGenero {
  genre: string;
  name: string;
  /** Fichas archivadas en este genero (su genero principal). */
  titles: number;
  /** Peliculas que declaran este genero, aunque no sea el principal. */
  tagged: number;
  files: { file: string; count: number }[];
}

export interface Indice {
  source: string;
  generated_at: string;
  total_titles: number;
  total_genres: number;
  genres: EntradaGenero[];
}

export interface Portada {
  generated_at: string;
  populares: Tarjeta[];
  mejor_valoradas: Tarjeta[];
  recientes: Tarjeta[];
  clasicos: Tarjeta[];
}

export interface ListaGenero {
  genre: string;
  name: string;
  count: number;
  titles: Tarjeta[];
}

export interface Rutas {
  bucket: string;
  count: number;
  /** id -> [genero, numero de parte] */
  titles: Record<string, [string, number]>;
}

/** [id, genero, titulo, año, nota] — va como tupla para que el trozo pese poco. */
export type EntradaBusqueda = [string, string, string, number | null, number | null];

export interface CuboBusqueda {
  letter: string;
  count: number;
  titles: EntradaBusqueda[];
}

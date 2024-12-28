import { getArtists } from "~/models/artist";
import type { Route } from "./+types/home";
import { Link, useLocation, useSearchParams } from "react-router";
import { getGenres } from "~/models/genre";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  let searchParams = new URL(request.url).searchParams;
  let q = searchParams.get("q");
  let genre = searchParams.get("genre");

  let [result, genres] = await Promise.all([getArtists(), getGenres()]);
  let artists;

  if (q) {
    // TODO: Search by genre
    artists = result.filter((item) =>
      item.name.toLowerCase().includes(q.toLowerCase())
    );
    return { artists, genres };
  }

  if (genre) {
    artists = result.filter((item) => {
      let genreTitles = item.genres.map((genre) => genre.title);
      return genreTitles.includes(genre);
    });

    return { artists, genres };
  }

  artists = result;

  return { artists, genres };
}

// export async function action() {
//   let artist = await createArtists();

//   console.log({ artist });
//   return null;
// }

interface Artist {
  id: number;
  name: string;
  url: string;
  genres: {
    id: number;
    title: string;
  }[];
  images: {
    id: number;
    url: string;
    height: number;
    width: number;
  }[];
}

interface Genre {
  id?: number;
  title: string;
  count?: number;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  let { artists, genres } = loaderData;
  // console.log({ artists });

  let genreTitles = genres.map((item) => item.title);

  let genreSet = new Set(genreTitles);

  // console.log({ genreSet });

  let genresArray: Array<Genre> = [];

  let index = 0;
  genreSet.forEach((item) => {
    let matchedItems = genres.filter((genre) => genre.title === item);
    genresArray.push({
      id: index + 1,
      title: item,
      count: matchedItems.length,
    });
    index++;
  });

  // console.log({ genresArray });

  // let navigation = useNavigation();
  // let isSubmitting = navigation.state === "submitting";

  return (
    <main>
      <Search />
      <GenrePicker genres={genresArray} />
      <ArtistList artists={artists} />
      {/* <Form method="post">
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-700 transition ease-in-out duration-300 px-4 py-2 rounded-md active:scale-[.95]"
        >
          {isSubmitting ? "Creating..." : "Create artists"}
        </button>
      </Form> */}
    </main>
  );
}

function Search() {
  let location = useLocation();

  let [searchParams] = useSearchParams();
  let q = searchParams.get("q") || "";
  return (
    <div className="search">
      <form>
        <label htmlFor="keyword-search">
          Search artists by name or genre:{" "}
        </label>
        <input
          type="search"
          name="q"
          id="keyword-search"
          className="px-4 py-2 rounded-md"
          defaultValue={q}
        />

        <button
          type="submit"
          className="bg-rose-400 hover:bg-rose-600 transition ease-in-out duration-300 active:scale-[.97] px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>
      {q.length > 1 ? (
        <div className="search-details">
          <span>Artists with name or genre matching “{q}”</span>
          <Link to={location.pathname} prefetch="intent">
            &times; clear search
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function GenrePicker({ genres }: { genres: Array<Genre> }) {
  let [searchParams] = useSearchParams();
  let selecetedGenre = searchParams.get("genre");
  let location = useLocation();

  let usp = new URLSearchParams(location.search);

  return (
    <nav className="genre-filters">
      {selecetedGenre ? (
        <Link to={location.pathname} className="control" prefetch="intent">
          &times; clear filters
        </Link>
      ) : null}
      {genres.map((item) => {
        // searchParams.set("genre", item.title);
        usp.set("genre", item.title);

        return (
          <Link
            key={item.id}
            to={`?${usp.toString()}`}
            // to={`${location.pathname}${location.search}`}
            prefetch="intent"
            className={`${
              selecetedGenre === item.title
                ? "genre-filter selected"
                : "genre-filter"
            }`}
          >
            {item.title} ({item.count})
          </Link>
        );
      })}
    </nav>
  );
}

function ArtistList({ artists }: { artists: Array<Artist> }) {
  return (
    <div className="artist-list">
      {artists.map((item) => (
        <div className="artist" key={item.id}>
          <img src={item.images[0].url} alt={item.name} />
          <div className="details">
            <h2>{item.name}</h2>
            <p>
              <a href={item.url}>View on Spotify</a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

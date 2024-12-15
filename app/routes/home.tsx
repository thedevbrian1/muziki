import { getArtists } from "~/models/artist";
import type { Route } from "./+types/home";
import { Form, useNavigation } from "react-router";
// import { createArtists } from "~/models/artist";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  let artists = await getArtists();

  return artists;
}

export async function action() {
  // let formData = await request.formData();
  // let artist = await createArtists();

  // console.log({ artist });
  return null;
}

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

export default function Home({ loaderData }: Route.ComponentProps) {
  let artists = loaderData;
  console.log({ artists });

  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";

  return (
    <main>
      <Search />
      <GenrePicker />
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
  return (
    <div className="search">
      <form>
        <label htmlFor="keyword-search">
          Search artists by name or genre:{" "}
        </label>
        <input type="search" name="q" id="keyword-search" />

        <button type="submit">Search</button>
      </form>
    </div>
  );
}

function GenrePicker() {
  return <div></div>;
}

function ArtistList({ artists }: { artists: Array<Artist> }) {
  return (
    <div className="artist-list">
      {artists.map((item) => (
        <div className="artist" key={item.id}>
          <img src={item.images[0].url} alt={item.name} />
          <div>
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

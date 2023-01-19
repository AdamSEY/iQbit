import {tmdbClient} from "./tmdbClient";
import {SearchResult} from "../types";
import ParseTorrent from "./ParseTorrent";

const TorrentNameToImage = async (fileName: string) => {

    const unavailable = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
    const parsed = ParseTorrent(fileName);

    const movies = await tmdbClient.searchMulti({
        query: parsed.title,
        include_adult: true,
    })

    let results = [] as SearchResult[] | undefined;
    if (movies.results) {
        results = movies.results.reduce((acc, curr) => {
            const d = curr as unknown as SearchResult;
            if (parsed.year && d.release_date && d.release_date.toString().includes(parsed.year.toString())) {
                acc.push(curr as unknown as SearchResult);
            }
            return acc;
        }, [] as SearchResult[]);
    }
    if (results && results.length > 0 && results[0].poster_path) {
        return `https://image.tmdb.org/t/p/w500${results[0].poster_path}`;
    }else{
        return unavailable;
    }
}

export default TorrentNameToImage;
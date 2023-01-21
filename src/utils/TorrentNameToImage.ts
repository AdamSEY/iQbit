import {tmdbClient} from "./tmdbClient";
import {ImageCached, SearchResult} from "../types";
import ParseTorrent from "./ParseTorrent";

const TorrentNameToImage = async (fileName: string) => {

    const unavailable = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
    const parsed = ParseTorrent(fileName);
    const result = {
        url: unavailable,
        parsed: parsed,
        searchResult: {} as SearchResult
    }
    const movies = await tmdbClient.searchMulti({
        query: parsed.title,
        include_adult: true,
    })

    let results = [] as SearchResult[] | undefined;
    if (movies.results) {
        results = movies.results.reduce((acc, curr) => {
            const d = curr as unknown as SearchResult;
            if (parsed.year && parsed.year > 0){
                if (d.release_date && d.release_date.toString().includes(parsed.year.toString())) {
                    acc.push(d);
                }
            }else{
                acc.push(d);
            }
            return acc;
        }, [] as SearchResult[]);
    }
    if (results && results.length > 0 && results[0].poster_path) {
        result.url = `https://image.tmdb.org/t/p/w500${results[0].poster_path}`;
        result.searchResult = results[0];
    }
    return result as ImageCached;
}

export default TorrentNameToImage;
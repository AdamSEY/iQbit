import PTN from "parse-torrent-title";
import {parser} from "../types";

const printIfDefined = (values: any[]) =>{
    let result = ``;
    values.forEach((value) => {
        if (value){
            result += ` ${value}`;
        }
    })
    return result;
}
const ParseTorrent = (fileName: string) => {
    const parsed = PTN.parse(fileName) as parser;
    parsed.title = parsed.title.replace(/\[.*?\]/g, "");
    parsed.title = parsed.title.replace(/[!@#$%^&*()_.:-]/g, " ");
    parsed.title = parsed.title.replace(/\s+/g, " ");
    parsed.title = parsed.title.trim();
    parsed.originalTitle = printIfDefined([parsed.title, parsed.year, parsed.season, parsed.episode]);
    parsed.title = parsed.title.toLowerCase();
    return parsed;
}

export default ParseTorrent;
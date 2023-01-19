import PTN from "parse-torrent-title";


const ParseTorrent = (fileName: string) => {
    const parsed = PTN.parse(fileName);
    parsed.title = parsed.title.replace(/[!@#$%^&*()_.:-]/g, " ");
    parsed.title = parsed.title.replace(/\s+/g, " ");
    parsed.title = parsed.title.trim();
    parsed.title = parsed.title.toLowerCase();
    return parsed;
}

export default ParseTorrent;
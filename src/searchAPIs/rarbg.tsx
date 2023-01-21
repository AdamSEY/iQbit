import {ImageCached, SearchProviderComponentProps} from "../types";
import { Flex, VStack } from "@chakra-ui/react";
import IosSearch from "../components/ios/IosSearch";
import { useMutation } from "react-query";
import TorrentDownloadBox from "../components/TorrentDownloadBox";
import SeedsAndPeers from "../components/SeedsAndPeers";
import React, {useEffect, useMemo, useState} from "react";
import TorrentMovieData from "../components/TorrentMovieData";
import Filters from "../components/Filters";
import { parseFromString, qualityAliases, typeAliases } from "./tpb";
import { rarbgAPI, RarbgCategoryDictionary } from "../utils/RarBGClient";
import ReactGA from "react-ga";
import TorrentNameToImage from "../utils/TorrentNameToImage";
import ParseTorrent from "../utils/ParseTorrent";


const RarbgSearch = (props: SearchProviderComponentProps) => {
  const {
    mutate: search,
    reset,
    data,
    isLoading,
  } = useMutation(
    "rarbgSearch",
    () =>
      rarbgAPI.search(
        props.searchState[0],
        props.category as keyof typeof RarbgCategoryDictionary
      ),
    {
      onMutate: () =>
        ReactGA.event({
          action: "executed",
          category: "search",
          label: "rarbg",
        }),
      onSuccess: (data) => {
        props.onSearch && props.onSearch();

        if (data?.rate_limit) {
          setTimeout(search, 2000);
          return;
        }

        let sourceList = new Set();

        data?.torrent_results?.forEach((torr) => {
          const type = parseFromString(torr.title, typeAliases);
          sourceList.add(type);
        });

        props.filterState.setSourceList(Array.from(sourceList) as string[]);
      },
    }
  );

  useEffect(() => {
    reset();
  }, [props.category, reset]);

  const filteredMovies = useMemo(() => {
    return (data?.torrent_results || [])
      .map((torr) => ({
        ...torr,
        pubdate: new Date(torr.pubdate),
      }))
      .filter((Torr) => {
        if (props.filterState.qualitySelected !== undefined){
          const parsedFileName = ParseTorrent(Torr.title);
          console.log(props.filterState.qualitySelected, parsedFileName.resolution)
          if (props.filterState.qualitySelected === parsedFileName.resolution) {
            return true;
          }
          if (props.filterState.qualitySelected === "2160p" && parsedFileName.resolution === "4k") {
            return true;
          }
        }else return true;
      })
      .filter((Torr) => {
        if (props.filterState.selectedSource !== "") {
          const type = parseFromString(Torr.title, typeAliases);
          return type === props.filterState.selectedSource;
        } else {
          return true;
        }
      })
      .filter((Torr) => {
        if (props.filterState.minSeeds !== "0") {
          return Torr.seeders >= parseInt(props.filterState.minSeeds || "0");
        } else {
          return Torr.seeders >= 5;
        }
      });
  }, [
    data,
    props.filterState.selectedSource,
    props.filterState.minSeeds,
    props.filterState.qualitySelected,
  ]);

  const [unifiedTitles, setUnifiedTitles] = useState<{[key: string]: string}>({});
  const [cachedImages, setCachedImages] = useState<{[key: string]: ImageCached}>({});

  useMemo(() => {
    filteredMovies.map(async (Torr) => {
      const parsed = ParseTorrent(Torr.title);
      if (!unifiedTitles.hasOwnProperty(parsed.title)) {
        setUnifiedTitles((prev) => ({...prev, [parsed.title]: Torr.title}));
      }
    })
  }, [filteredMovies])

  useMemo(() => {
    // loop over cachedImages and set the image if it's not set yet.
    Object.keys(unifiedTitles).map(async (title) => {
      if (!cachedImages[title]) {
        const result = await TorrentNameToImage(unifiedTitles[title]);
        setCachedImages((prev) => ({...prev, [title]: result}));
      }
    })

  }, [unifiedTitles])





  return (
    <VStack>
      <IosSearch
        value={props.searchState[0]}
        onChange={(e) => props.searchState[1](e.target.value)}
        isLoading={isLoading}
        onSearch={search}
        placeholder={`Search ${props.category}...`}
      />
      {<Flex flexDirection={"column"} gap={2} width={"100%"}>
        {(!data?.torrent_results?.length || true) && (
          <Filters {...props.filterState} />
        )}
        {filteredMovies.map((result) => {
              const torrentInfo = cachedImages[ParseTorrent(result.title).title];
              const language = new Intl.DisplayNames(['en'] , {type: "language"});
              const lang = language.of(torrentInfo?.searchResult?.original_language || "en");
              return (
                  <TorrentDownloadBox
                      key={result.title}
                      magnetURL={result.download}
                      imageUrl={torrentInfo?.url}
                      searchResult={torrentInfo?.searchResult}
                      title={result.title}>
                    <TorrentMovieData
                        quality={parseFromString(result.title, qualityAliases)}
                        type={parseFromString(result.title, typeAliases)}
                        size={parseInt(result.size.toString())}
                        language={lang}
                    />

                    <SeedsAndPeers
                        seeds={result.seeders.toString()}
                        peers={result.leechers.toString()}
                    />
                  </TorrentDownloadBox>
              )
            }
        )}
      </Flex>}
    </VStack>
  );
};

export default RarbgSearch;

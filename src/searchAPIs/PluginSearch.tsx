import React, { useMemo, useState, useEffect } from "react";
import {SearchProviderComponentProps, SearchResult} from "../types";
import IosSearch from "../components/ios/IosSearch";
import {
    AspectRatio,
    Box,
    Button, filter,
    Flex,
    Heading,
    LightMode,
    Spinner,
    useColorModeValue, useDisclosure,
    VStack,
} from "@chakra-ui/react";


import { useMutation, useQuery } from "react-query";
import { TorrClient } from "../utils/TorrClient";
import TorrentDownloadBox from "../components/TorrentDownloadBox";
import SeedsAndPeers from "../components/SeedsAndPeers";
import { IoList, IoStop } from "react-icons/io5";
import { useIsLargeScreen } from "../utils/screenSize";
import { StatWithIcon } from "../components/StatWithIcon";
import { parseFromString, qualityAliases, typeAliases } from "./tpb";
import Filters from "../components/Filters";
import TorrentMovieData from "../components/TorrentMovieData";
import stringSimilarity from 'string-similarity'
import TorrentNameToImage from "../utils/TorrentNameToImage";
import ParseTorrent from "../utils/ParseTorrent";


const PluginSearch = (props: SearchProviderComponentProps) => {


    const [searchId, setSearchId] = useState<number>();
    const isLarge = useIsLargeScreen();

    const stickyBgColorInTab = useColorModeValue(
        isLarge ? "whiteAlpha.800" : "whiteAlpha.300",
        "blackAlpha.500"
    );

    const { mutate: createSearch, isLoading: createLoading } = useMutation(
        "createSearch",
        (query: string) => TorrClient.createSearch(query),
        {
            onSuccess: (res) => {
                setSearchId(res.id);
            },
        }
    );

    const { mutate: deleteSearch } = useMutation(
        "deleteSearch",
        () => TorrClient.deleteSearch(searchId!),
        {
            onSuccess: () => setSearchId(undefined),
        }
    );

    const { mutate: stopSearch } = useMutation(
        "stopSearch",
        () => TorrClient.stopSearch(searchId!),
        {
            onSuccess: () => deleteSearch(),
        }
    );

    const { data } = useQuery(
        "getSearches",
        () => TorrClient.getResults(searchId!),
        {
            refetchInterval: 1000,
            enabled: !!searchId,
        }
    );

    useEffect(() => {
        if (data?.results && data.results.length > 400) {
            stopSearch();
        }
    }, [data, stopSearch])

    let filteredResults = useMemo(() => {
        return (data?.results || [])
            .filter((Torr) => {
                if (props.filterState.qualitySelected !== undefined) {
                    const qual = parseFromString(Torr.fileName, qualityAliases);
                    return qual === props.filterState.qualitySelected;
                } else {
                    return true;
                }
            })
            .filter((Torr) => {
                if (props.filterState.selectedSource !== "") {
                    const type = parseFromString(Torr.fileName, typeAliases);
                    return type === props.filterState.selectedSource;
                } else {
                    return true;
                }
            })
            // filter: filename has to contain props.searchState[0]
            .filter((Torr) => {
                const parsedSearch = ParseTorrent(props.searchState[0]);
                const parsedFileName = ParseTorrent(Torr.fileName);
                // if the title is not similar to what we're search for, don't show it.
                // SearchPlugin sometimes returns unrelated
                // results.
                const similarity = stringSimilarity.compareTwoStrings(parsedSearch.title, parsedFileName.title);
                return similarity > 0.3;
            })
            // sort by most seeds
            .sort((a, b) => b.nbSeeders - a.nbSeeders)
            .filter((Torr) => {
                if (props.filterState.minSeeds !== "0") {
                    return Torr.nbSeeders >= parseInt(props.filterState.minSeeds || "0");
                } else {
                    // default value is 5.
                    return Torr.nbSeeders >= 5;
                }
            })

    }, [
        data,
        props.filterState.selectedSource,
        props.filterState.minSeeds,
        props.filterState.qualitySelected,
    ]);

    const [unifiedTitles, setUnifiedTitles] = useState<{[key: string]: string}>({});
    const [cachedImages, setCachedImages] = useState<{[key: string]: string}>({});
    const [finished, setFinished] = useState(false);
    useEffect(() => {
        filteredResults.map(async (Torr) => {
            const parsed = ParseTorrent(Torr.fileName);
            if (!unifiedTitles.hasOwnProperty(parsed.title)) {
                setUnifiedTitles((prev) => ({...prev, [parsed.title]: Torr.fileName}));
            }
        })
    }, [filteredResults])

    useEffect(() => {
        // loop over cachedImages and set the image if it's not set yet.
        Object.keys(unifiedTitles).map(async (title) => {
            if (!cachedImages[title]) {
                const image = await TorrentNameToImage(unifiedTitles[title]);
                setCachedImages((prev) => ({...prev, [title]: image}));
            }
            if (Object.keys(cachedImages).length === Object.keys(unifiedTitles).length) {
                setFinished(true);
            }
        })

    }, [unifiedTitles])

    return (
        <VStack>
            <IosSearch
                value={props.searchState[0]}
                onChange={(e) => props.searchState[1](e.target.value)}
                isLoading={createLoading}
                onSearch={() => createSearch(props.searchState[0])}
                placeholder={`Search ${props.category}...`}
            />

            {searchId && finished && cachedImages && (
                <Flex
                    position={"sticky"}
                    top={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    rounded={"lg"}
                    p={4}
                    w={"100%"}
                    backdropFilter={"blur(15px)"}
                    bgColor={stickyBgColorInTab}
                    zIndex={50}
                >
                    <Flex alignItems={"center"} gap={4}>
                        <Spinner color={"blue.500"} />
                        <Flex flexDirection={"column"} alignItems={"start"}>
                            <Heading size={"md"}>Search in progress...</Heading>
                            <StatWithIcon
                                icon={<IoList />}
                                label={(data?.total || 0) + " Results"}
                            />
                        </Flex>
                    </Flex>
                    <LightMode>
                        <Button
                            leftIcon={<IoStop />}
                            colorScheme={"blue"}
                            onClick={() => stopSearch()}
                        >
                            Stop
                        </Button>
                    </LightMode>
                </Flex>
            )}
            {(!data?.results?.length || true) && <Filters {...props.filterState} />}

            {filteredResults.map((result) => (

                <TorrentDownloadBox
                    key={result.fileUrl}
                    magnetURL={result.fileUrl}
                    imageUrl={cachedImages[ParseTorrent(result.fileName).title]}
                    title={result.fileName}>
                    <TorrentMovieData
                        quality={parseFromString(result.fileName, qualityAliases)}
                        type={parseFromString(result.fileName, typeAliases)}
                        size={parseInt(result.fileSize.toString())}
                    />
                    <SeedsAndPeers
                        seeds={result.nbSeeders.toString()}
                        peers={result.nbLeechers.toString()}
                    />
                </TorrentDownloadBox>
            ))}
        </VStack>
    );
};

export default PluginSearch;

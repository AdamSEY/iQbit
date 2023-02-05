import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Flex,
    Image,
    LightMode,
    Spinner,
    Text,
    useColorModeValue,
    useDisclosure,
    NumberInputField,
    NumberInput,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    CheckboxGroup, Stack, Checkbox, AccordionButton, AccordionIcon, AccordionPanel, AccordionItem, Accordion, VStack, HStack,
} from "@chakra-ui/react";
import PageHeader from "../components/PageHeader";
import { useMutation, useQuery } from "react-query";
import { tmdbClient } from "../utils/tmdbClient";
import PosterGrid from "../components/PosterGrid";
import { MovieResult, TvResult } from "moviedb-promise";
import SegmentedPicker from "../components/SegmentedPicker";
import IosBottomSheet from "../components/ios/IosBottomSheet";
import { createYTSMagnetLink, SectionSM } from "../searchAPIs/yts";
import { YTSClient } from "../utils/YTSClient";
import TorrentDownloadBox from "../components/TorrentDownloadBox";
import TorrentMovieData from "../components/TorrentMovieData";
import SeedsAndPeers from "../components/SeedsAndPeers";
import { providers } from "./SearchPage";
import { useNavigate } from "react-router-dom";
import { SearchPluginsPageQuery } from "./SearchPluginsPage";
import { TorrClient } from "../utils/TorrClient";
import {Input} from "@chakra-ui/input";
import TorrentExtraInfo from "../components/TorrentExtraInfo";
import {Movie, RottenTomatoesResponse} from "../types";
import BottomSheet from "../components/BottomSheet";
import {hostname} from "os";


export interface TrendingPageProps {}

const smallImage = "https://image.tmdb.org/t/p/w200";
const originalImage = "https://image.tmdb.org/t/p/original";
const genres = [
    "action",
    "adventure",
    "animation",
    "anime",
    "biography",
    "comedy",
    "crime",
    "documentary",
    "drama",
    "entertainment",
    "faith and spirituality",
    "fantasy",
    "game show",
    "lgbtq",
    "health and wellness",
    "history",
    "holiday",
    "horror",
    "house and garden",
    "kids and family",
    "music",
    "musical",
    "mystery and thriller",
    "nature",
    "news",
    "reality",
    "romance",
    "sci fi",
    "short",
    "soap",
    "special interest",
    "sports",
    "stand up",
    "talk show",
    "travel",
    "variety",
    "war",
    "western"
];


const TrendingPage = (props: TrendingPageProps) => {
    const tabs = ["Movies", "TV", "TOP 100", "Year", "Rotten"];
    const [tab, setTab] = useState(0);


    const [selectedMovie, setSelectedMovie] = useState<MovieResult>();
    const movieBottomSheet = useDisclosure();
    const { data: trendingMovies } = useQuery("getTrendingMovies", async () =>
        tmdbClient.trending({
            media_type: "movie",
            time_window: "day",
        })
    , { enabled: tab === 0 });


    const [page, setPage] = React.useState(1)
    const [topMoviesData, setTopMoviesData] = useState<MovieResult[]>([]);
    useQuery({
        queryKey: ['getTopMovies', page],
        queryFn: () => tmdbClient.movieTopRated({
            page: page,
        }),
        onSuccess: (data) => {
            setTopMoviesData(data?.results ?? []);
        },
        keepPreviousData : true,
        enabled: tab === 2,
    })

    const fetchRottenMovies = async (rottenPage?: string, genres?: string) => {
        let url = `https://www.rottentomatoes.com/napi/browse/movies_at_home/critics:certified_fresh~sort:popular`;
        let headers = new Headers();
        headers.append("X-Requested-With", "XMLHttpRequest");
        if (genres) {
            url += `~genres:${genres}`
        }
        if (rottenPage) {
            url += `?after=${rottenPage}`
        }
        // use local cors-anywhere proxy.
        const proxyurl = window.location.protocol + '//' + window.location.hostname + ":8080/";
        // const proxyurl = "https://cors-anywhere.herokuapp.com/";

        const response = await fetch(proxyurl + url, {
            headers: headers,
        });
        return await response.json() as RottenTomatoesResponse;
    }
    const [rottenPage, setRottenPage] = React.useState<string|undefined>(undefined)
    const [rottenGenres, setRottenGenres] = React.useState<string|undefined>(undefined)
    const [rottenMoviesData, setRottenMoviesData] = useState<RottenTomatoesResponse>();
    const rottenDisclosure = useDisclosure();
    const [selectedRottenMovie, setSelectedRottenMovie] = useState<Movie>();
    const {isLoading: rottenLoading, isRefetching} = useQuery({
        queryKey: ['getRottenMovies', rottenPage, rottenGenres],
        queryFn: () => fetchRottenMovies(rottenPage, rottenGenres),
        onSuccess: (data) => {
            setRottenMoviesData(data);
        },
        keepPreviousData : true,
        enabled: tab === 4,
    });


    const [page1, setPage1] = React.useState(1)
    const [year, setYear] = React.useState(new Date().getFullYear())
    const [yearTrending, setYearTrending] = useState<MovieResult[]>([]);
    useQuery({
        queryKey: ['yearTrending', page1, year],
        queryFn: () => tmdbClient.discoverMovie({
            page: page1,
            year: year,
            sort_by: "popularity.desc",
        }),
        onSuccess: (data) => {
            setYearTrending(data?.results ?? []);
        },
        keepPreviousData : true,
        enabled: tab === 3,
    })


    const {
        data: TorrData,
        mutate: getTorrs,
        isLoading: torrsLoading,
    } = useMutation((search: string) =>
        YTSClient.search({
            query_term: search,
        })
    );

    const tvBottomSheet = useDisclosure();
    const [selectedTv, setSelectedTv] = useState<TvResult>();
    const { data: trendingTv } = useQuery("getTrendingTv", async () =>
        tmdbClient.trending({
            media_type: "tv",
            time_window: "day",
        })
        , { enabled: tab === 1 }
    );

    const { data: plugins } = useQuery(
        SearchPluginsPageQuery,
        TorrClient.getInstalledPlugins
    );

    const bgColor = useColorModeValue("grayAlpha.200", "grayAlpha.400");

    const push = useNavigate();

    const providerMapper = useMemo(() => {
        return Object.entries(providers)
            .filter(([key]) => key !== "YTS")
            .filter(([key]) =>
                (plugins?.length || 0) > 0 ? true : key !== "plugin"
            );
    }, [plugins?.length]);

    return (
        <>
            <PageHeader title={"Trending"} />

            {tab === 4 ? (
                <Text color={"gray.400"}>Top Critically Acclaimed Movies From RottenTomato</Text>
            ) : <Text color={"gray.500"}>Trending Movies and Shows from TMDB.</Text>}
            <SegmentedPicker options={tabs} selected={tab} onSelect={setTab} />
            {tab === 0 ? (
                <PosterGrid
                    list={(trendingMovies?.results as MovieResult[]) || []}
                    keyExtractor={(item) =>
                        item?.id?.toString() || Math.random().toString()
                    }
                    titleExtractor={(movie) => movie?.title || "Unknown Title"}
                    images={(movie) => ({
                        large: originalImage + movie.poster_path || "",
                        small: smallImage + movie.poster_path || "",
                    })}
                    onSelect={(movie) => {
                        getTorrs(
                            `${movie?.title} ${movie?.release_date?.split("-")?.[0] || ""}`
                        );
                        movieBottomSheet.onOpen();
                        setSelectedMovie(movie);
                    }}
                />
            ) : tab === 1 ? (
                <PosterGrid
                    list={(trendingTv?.results as TvResult[]) || []}
                    keyExtractor={(show) =>
                        show?.id?.toString() || Math.random().toString()
                    }
                    titleExtractor={(show) => show?.name || "Unknown Show"}
                    images={(show) => ({
                        large: originalImage + show.poster_path || "",
                        small: smallImage + show.poster_path || "",
                    })}
                    onSelect={(show) => {
                        setSelectedTv(show);
                        tvBottomSheet.onOpen();
                    }}
                />
            ) : tab === 2 ? (

                <><PosterGrid
                    list={(topMoviesData as MovieResult[]) || []}
                    keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                    titleExtractor={(movie) => movie?.title || "Unknown Title"}
                    images={(movie) => ({
                        large: originalImage + movie.poster_path || "",
                        small: smallImage + movie.poster_path || "",
                    })}
                    onSelect={(movie) => {
                        movieBottomSheet.onOpen();
                        setSelectedMovie(movie);
                    }}/>
                    {topMoviesData.length > 0 && (
                    <Button
                        variant={"ghost"}
                        size={"xl"}
                        colorScheme={"blue"}
                        onClick={()=>{setPage(page+1)}}
                    >
                        Load More
                    </Button>)}
                </>

            ) : tab === 3 ? (

                <>

                    <NumberInput onChange={(e)=>{
                        if (e.length === 4) {
                            setYear(parseInt(e));
                            setPage1(1)
                        }
                    }} defaultValue={year} min={1920} max={2030}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <PosterGrid
                    list={(yearTrending as MovieResult[]) || []}
                    keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                    titleExtractor={(movie) => movie?.title || "Unknown Title"}
                    images={(movie) => ({
                        large: originalImage + movie.poster_path || "",
                        small: smallImage + movie.poster_path || "",
                    })}
                    onSelect={(movie) => {
                        movieBottomSheet.onOpen();
                        setSelectedMovie(movie);
                    }}/>
                    <Button
                        variant={"ghost"}
                        size={"xl"}
                        colorScheme={"blue"}
                        onClick={() => {setPage1(page1+1)}}
                    >
                        Load More
                    </Button>
                </>
            ) : tab === 4 ? (
                <>
                    <Accordion  allowMultiple>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Genres
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel overflowY={"auto"} maxH={40} pb={4}>
                                <CheckboxGroup colorScheme='blue' onChange={e => {
                                    setRottenPage(undefined);
                                    setRottenGenres(e.join(','))
                                }} defaultValue={[]}>
                                    <Flex gap='2' direction={['row', 'column']}>
                                        {genres.map(value => (
                                            <Checkbox key={value} value={value}>
                                                {value}
                                            </Checkbox>
                                        ))}
                                    </Flex>
                                </CheckboxGroup>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>

                    {rottenLoading || isRefetching? (
                        <Flex p={3}>
                            <Spinner size={"xl"} />
                        </Flex>
                        ) : (
                        <PosterGrid
                            list={(rottenMoviesData?.grids?.[0].list as Movie[]) || []}
                            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                            titleExtractor={(movie) => movie?.title || "Unknown Title"}
                            images={(movie) => ({
                                large: movie.posterUri || "",
                                small: movie.posterUri || "",
                            })}
                            emptyMessage={"No results! Please make sure to run cors-anywhere on port 8080 in order for this to work."}
                            onSelect={(movie) => {
                                rottenDisclosure.onOpen();
                                setSelectedRottenMovie(movie);
                            }}/>
                    )}
                    {rottenMoviesData?.pageInfo?.endCursor ? (
                    <Button
                        variant={"ghost"}
                        size={"xl"}
                        colorScheme={"blue"}
                        onClick={()=>{setRottenPage(rottenMoviesData?.pageInfo?.endCursor)}}
                    >
                        Load More
                    </Button>) : null}
                </>
            ) : null}

            <IosBottomSheet
                modalProps={{ size: "xl" }}
                title={selectedMovie?.title ?? ""}
                disclosure={movieBottomSheet}
            >
                <Flex flexDirection={"column"} gap={4}>
                    <SectionSM title={"Download from YTS"}>
                        {torrsLoading ? (
                            <Flex justifyContent={"center"} w={"full"}>
                                <Spinner color={"blue"} mt={3} />
                            </Flex>
                        ) : (TorrData?.movies?.[0]?.torrents?.length || 0) === 0 ? (
                            <Flex flexDirection={"column"} gap={4} w={"100%"}>
                                <Text opacity={0.5}>
                                    YTS might have it but I did not find it automagically.
                                </Text>
                                {providerMapper.map(([key, data]) => (
                                    <Flex
                                        key={key}
                                        flexDirection={{ base: "column", lg: "row" }}
                                        alignItems={"center"}
                                        gap={3}
                                        bg={bgColor}
                                        rounded={"lg"}
                                        justifyContent={"space-between"}
                                        p={3}
                                        flexGrow={1}
                                        minWidth={{ base: "200px", lg: "100%" }}
                                        maxWidth={{ base: "100%", lg: undefined }}
                                    >
                                        <Flex>{data.logo}</Flex>
                                        <LightMode>
                                            <Button
                                                colorScheme={"blue"}
                                                onClick={() =>
                                                    push("/search", {
                                                        replace: true,
                                                        state: {
                                                            provider: key,
                                                            query: `${selectedMovie?.title} ${
                                                                selectedMovie?.release_date?.split("-")?.[0]
                                                            }`,
                                                        },
                                                    })
                                                }
                                            >
                                                Search with {key}
                                            </Button>
                                        </LightMode>
                                    </Flex>
                                ))}
                            </Flex>
                        ) : (
                            <Box p={3} rounded={"md"} bgColor={bgColor} w={"full"}>
                                <Text>
                                    Showing torrents for <b>{TorrData?.movies?.[0].title}</b>{" "}
                                    released in <b>{TorrData?.movies?.[0].year}</b>
                                </Text>
                            </Box>
                        )}

                        {(TorrData?.movies?.[0].torrents || []).map((torrent) => {
                            return (
                                <TorrentDownloadBox
                                    key={torrent.hash}
                                    magnetURL={createYTSMagnetLink(
                                        torrent.hash,
                                        `${TorrData?.movies[0].title} (${
                                            TorrData?.movies[0].year || "--"
                                        })` || "Title not found"
                                    )}
                                >
                                    <Flex flexDirection={"column"} width={"100%"}>
                                        <TorrentMovieData
                                            quality={torrent.quality}
                                            type={torrent.type}
                                            size={torrent.size_bytes}
                                        />
                                        <SeedsAndPeers
                                            seeds={torrent.seeds.toString()}
                                            peers={torrent.peers.toString()}
                                        />
                                    </Flex>
                                </TorrentDownloadBox>
                            );
                        })}
                    </SectionSM>
                    <TorrentExtraInfo image={originalImage + selectedMovie?.backdrop_path} overview={selectedMovie?.overview} title={selectedMovie?.title ?? ""}/>

                </Flex>
            </IosBottomSheet>
            <BottomSheet title={selectedTv?.name ?? ""}
                         disclosure={tvBottomSheet}
                         providerMapper={providerMapper}
                         picture={originalImage + selectedTv?.backdrop_path} overview={selectedTv?.overview} />
            <BottomSheet title={selectedRottenMovie?.title ?? ""}
                         disclosure={rottenDisclosure}
                         providerMapper={providerMapper}
                         picture={selectedRottenMovie?.posterUri ?? ""} overview={selectedRottenMovie?.releaseDateText} />

        </>
    );
};

export default TrendingPage;

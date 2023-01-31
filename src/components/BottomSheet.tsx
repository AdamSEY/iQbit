import React from "react";
import IosBottomSheet from "./ios/IosBottomSheet";
import {Button, Flex, LightMode} from "@chakra-ui/react";
import {SectionSM} from "../searchAPIs/yts";
import TorrentExtraInfo from "./TorrentExtraInfo";
import {useNavigate} from "react-router-dom";
import {Provider} from "../pages/SearchPage";


export interface BottomSheetProps {
    title: string,
    disclosure: any,
    providerMapper: [string, Provider][]
    picture: string,
    overview: string | undefined,
}


const BottomSheet = (props: BottomSheetProps) => {
    const push = useNavigate();
    const {title, picture, disclosure, providerMapper, overview} = props;
    return (
    <IosBottomSheet
        title={title}
        disclosure={disclosure}
        modalProps={{ size: "xl" }}
    >
        <Flex flexDirection={"column"} gap={4}>
            <SectionSM title={"Search Torrent"}>
                <Flex
                    flexWrap={"wrap"}
                    gap={3}
                    flexDirection={{ base: "row", lg: "column" }}
                    width={"100%"}
                >
                    {providerMapper.map(([key, data]) => (
                        <Flex
                            key={key}
                            flexDirection={{ base: "column", lg: "row" }}
                            alignItems={"center"}
                            gap={3}
                            bg={'grayAlpha.200'}
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
                                            state: { provider: key, query: title },
                                        })
                                    }
                                >
                                    Search with {key}
                                </Button>
                            </LightMode>
                        </Flex>
                    ))}
                </Flex>
            </SectionSM>
            <TorrentExtraInfo image={picture} overview={overview} title={title || ""}/>
        </Flex>
    </IosBottomSheet>
)
}


export default BottomSheet;

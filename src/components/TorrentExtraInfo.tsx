import React from "react";
import {Button, Center, Flex, Heading, Image, Text} from "@chakra-ui/react";
import WebTorrentModel from "./WebTorrentModel";
import {SectionSM} from "../searchAPIs/yts";


export interface TorrentExtraInfoProps {
    image?: string
    overview?: string;
    title?: string
    magnet_uri?: string;
}

const TorrentExtraInfo = (props: TorrentExtraInfoProps) => {

    return (
        <Heading size={"sm"} wordBreak={"break-all"}>
            {props.image && <Center><Image src={props.image} /></Center>}
             <Flex justifyContent={"center"} w={"full"}>
                 {props.title &&
                <Button
                    m={2}
                    colorScheme={"gray"}
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${props.title}+trailer`, "_blank")}
                >
                    View Trailer
                </Button>
                 }
                {props.magnet_uri && <WebTorrentModel link={props.magnet_uri} />}
            </Flex>
            {props.overview && <SectionSM title={"Description"}>
                <Text p={2} fontSize={'14px'} fontWeight={300}>{props.overview}</Text>
            </SectionSM>}


        </Heading>
    )
};

export default TorrentExtraInfo;

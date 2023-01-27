import React, {PropsWithChildren} from "react";
import {

  Button, Text,
  Flex,
  Heading,
  LightMode,
  useColorModeValue,
  Stack, Link,
} from "@chakra-ui/react";
import { useIsLargeScreen } from "../utils/screenSize";
import { useMutation } from "react-query";
import { TorrClient } from "../utils/TorrClient";
import {IoCheckmark, IoOpen} from "react-icons/io5";
import { Image } from "@chakra-ui/image";
import { Card, CardHeader, CardBody, CardFooter, StackDivider } from '@chakra-ui/react'
import {SearchResult} from "../types";
import TorrentExtraInfo from "./TorrentExtraInfo";

export interface TorrentDownloadBoxProps {
  title?: string;
  magnetURL?: string;
  imageUrl?: string;
  searchResult?: SearchResult;
  onSelect?: () => Promise<string>;
}

const TorrentDownloadBox = ({
                              magnetURL,
                              title,
                              imageUrl,
                              searchResult,
                              onSelect,
                              children,
                            }: PropsWithChildren<TorrentDownloadBoxProps>) => {
  const isLarge = useIsLargeScreen();

  const { mutate, isLoading, isSuccess } = useMutation(
      "addBox",
      (magnetURLParam: string) => TorrClient.addTorrent("urls", magnetURLParam)
  );

  const {
    mutate: callbackMutation,
    isLoading: callbackLoading,
    isSuccess: callbackSuccess,
  } = useMutation("addBoxWithCallback", () => onSelect!(), {
    onSuccess: (magnetURL) => mutate(magnetURL),
  });

  const bgColor = useColorModeValue("grayAlpha.200", "grayAlpha.400");
  return (
      <Flex
          p={1}
          bgColor={bgColor}
          width={"100%"}
          justifyContent={"space-between"}
          rounded={6}
          alignItems={"left"}
          flexWrap={"wrap"}
          gap={3}
          wrap={{ base: "wrap", lg: "nowrap" }}
      >

        <Card
            direction={{ base: 'row', md: 'row', sm: 'column'}}
            flex={1}
            overflow='hidden'
            variant='outline'
        >
          {imageUrl && <Image
              objectFit='cover'
              maxW={{ base: '100%', sm: '200px' }}
              src={imageUrl}
              alt={title}
          />}

          <Stack>
            <CardBody>
              <Heading size='sm'>{title?.replace('.', ' ')}</Heading>
              {children}
              <Text py='2'>
                {searchResult?.overview}
              </Text>
            </CardBody>
            <CardFooter>
              <LightMode>
              <Button variant='solid' colorScheme={isSuccess ? "green" : "blue"}
                      minW={32}
                      disabled={
                          isSuccess || callbackSuccess || callbackLoading || isLoading
                      }
                      isLoading={isLoading || callbackLoading}
                      width={!isLarge ? "100%" : undefined}
                      onClick={() => {
                        if (magnetURL) {
                          mutate(magnetURL);
                        } else if (onSelect) {
                          callbackMutation();
                        }
                      }}
                      leftIcon={isSuccess ? <IoCheckmark /> : undefined}>
                {isSuccess ? "Downloading" : "Download"}
              </Button>
               <TorrentExtraInfo magnet_uri={magnetURL} />
              </LightMode>
            </CardFooter>
          </Stack>
        </Card>


      </Flex>

  );

}

export default TorrentDownloadBox;

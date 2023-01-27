import React from "react";
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Link,
    Text, useDisclosure, Flex, Center, Square, Box
} from "@chakra-ui/react";
import {IoOpen} from "react-icons/io5";


export interface webTorrentModelProps {
    link: string;
}

const WebTorrentModel = (props: webTorrentModelProps) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            <Button ml={2} onClick={onOpen}>Watch Online</Button>

            <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>

                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Watch Online</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6} width={'100%'} height={'100%'}>
                        <Text color={"red"}>This service will expose your IP address if you're not using a VPN as it relays on your browser IP address</Text>
                        <Text>Magnet: #{decodeURIComponent(props.link)}</Text>
                        <Box p={4} >
                            <Flex color='white'>
                                <Center>
                                    <Button colorScheme={'blue'} leftIcon={<IoOpen/>} as={Link} href={`https://www.utorrent.com/lite/#/player/${props.link}`} isExternal>
                                        Go To UTorrent Lite
                                    </Button>
                                    {/*<iframe name={'webTorrent'} src={`https://btorrent.xyz/#${props.link}`} width={'100%'} height={'100%'}></iframe>*/}
                                </Center>
                            </Flex>
                        </Box>
                    </ModalBody>


                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
};

export default WebTorrentModel;

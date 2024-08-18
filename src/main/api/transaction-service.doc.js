module.exports.transactionSpec = {
    "paths": {
        "/transaction/sign": {
            "post": {
                "tags": ["Transaction Service"],
                "summary": "Sign a transaction",
                "description": "This endpoint signs a transaction using the provided master key label, chain name, derivation path, and transaction data.",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "masterKeyLabel": {
                                        "type": "string",
                                        "description": "The label of the master key",
                                        "example": "master-key-1"
                                    },
                                    "chainName": {
                                        "type": "string",
                                        "description": "The name of the blockchain",
                                        "example": "ethereum"
                                    },
                                    "derivationPath": {
                                        "type": "string",
                                        "description": "The derivation path for the key",
                                        "example": "m/44'/60'/0'/0/0"
                                    },
                                    "transaction": {
                                        "type": "object",
                                        "description": "The transaction data to be signed"
                                    }
                                },
                                "required": ["masterKeyLabel", "chainName", "transaction"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "success": {
                                            "type": "boolean"
                                        },
                                        "signature": {
                                            "type": "object",
                                            "description": "The generated transaction with the signature",
                                            example: {
                                                "transaction": {
                                                    "nonce": "02",
                                                    "gasPrice": "12a05f2000",
                                                    "gas": "01d4c0",
                                                    "to": "0x487CFbd0774443a8CE95A253e96697b1304dD9D7",
                                                    "value": "",
                                                    "data": "0x6a76120200000000000000000000000017997e53c1a5066c463e5f0530414cb859da06950000000000000000000000000000000000000000000000000011c37937e080000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000082ad5cc03fe76baf0d07b2d9e95ac6745d00a6e6d9f2d233bc2be28b899e061e3f35e2322f7b64263469382c629699127493546da067dbbedec452b47350a0920b1b10c0f8969cce5eed62e9ad140d965bbb1e3d2426b1b9b72ba9a05c159fb9e3a17c4cacc34e01eda3d38564e882a143209eda284ba33c30c41eaa80e8fc16a6ae1b000000000000000000000000000000000000000000000000000000000000",
                                                    "v": "01546d72",
                                                    "r": "0x5e4b8fcac952371a05cb25c7542d0f0544d43c2cf2eec31b7c5246823d8345b8",
                                                    "s": "0x39415bed60166f5d0e389d1b269313b879187a383c493e1da9bd016ae40eb735"
                                                },
                                                "txForBroadcast": "0xf9028f028512a05f20008301d4c094487cfbd0774443a8ce95a253e96697b1304dd9d780b902246a76120200000000000000000000000017997e53c1a5066c463e5f0530414cb859da06950000000000000000000000000000000000000000000000000011c37937e080000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000082ad5cc03fe76baf0d07b2d9e95ac6745d00a6e6d9f2d233bc2be28b899e061e3f35e2322f7b64263469382c629699127493546da067dbbedec452b47350a0920b1b10c0f8969cce5eed62e9ad140d965bbb1e3d2426b1b9b72ba9a05c159fb9e3a17c4cacc34e01eda3d38564e882a143209eda284ba33c30c41eaa80e8fc16a6ae1b0000000000000000000000000000000000000000000000000000000000008401546d72a05e4b8fcac952371a05cb25c7542d0f0544d43c2cf2eec31b7c5246823d8345b8a039415bed60166f5d0e389d1b269313b879187a383c493e1da9bd016ae40eb735",
                                                "signedTxHash": "0x5c7695d0f6a43baae91743599e18287d89acf34d844fd3195908d88e82f43d2c"
                                            }
                                        },
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        success: {
                                            "type": "boolean",
                                            "example": false
                                        },
                                        "error": {
                                            "type": "string",
                                            "example": "Error signing data: Invalid child index"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/transaction/signHash": {
            "post": {
                "tags": ["Transaction Service"],
                "summary": "Sign a hash",
                "description": "This endpoint signs a hash using the provided master key label, chain name, derivation path, and hash data.",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "masterKeyLabel": {
                                        "type": "string",
                                        "description": "The label of the master key",
                                        "example": "master-key-1"
                                    },
                                    "chainName": {
                                        "type": "string",
                                        "description": "The name of the blockchain",
                                        "example": "ethereum"
                                    },
                                    "derivationPath": {
                                        "type": "string",
                                        "description": "The derivation path for the key",
                                        "example": "m/44'/60'/0'/0/0"
                                    },
                                    "hash": {
                                        "type": "string",
                                        "description": "The hash to be signed"
                                    }
                                },
                                "required": ["masterKeyLabel", "chainName", "hash"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "success": {
                                            "type": "boolean"
                                        },
                                        "signature": {
                                            "type": "object",
                                            "example":  {
                                                "r": "0xda2d46152f9a3660c45ddfd6d69f7c8e8fb210ac9512421bf2e8f91689374a98",
                                                "s": "0x77b0488848107c0c6963f9339715df40c455dc30202038a5419c2da4df77a254",
                                                "v": "01546d71",
                                                "signedHash": "0x30194b928168246ca9227506db02ef4991dca1871f7f6d3ed4490d3e2727b498",
                                                "rawSignature": "0xda2d46152f9a3660c45ddfd6d69f7c8e8fb210ac9512421bf2e8f91689374a9877b0488848107c0c6963f9339715df40c455dc30202038a5419c2da4df77a254",
                                                "address": "0xed1e4bcd07120660cd2cae9d959fd924b1bb7449"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        success: {
                                            "type": "boolean",
                                            "example": false
                                        },
                                        "error": {
                                            "type": "string",
                                            "example": "Error signing data: Invalid child index"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
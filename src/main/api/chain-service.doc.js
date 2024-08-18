module.exports.chainSpec = {
    "paths": {
        "/chain/onboard": {
            "post": {
                tags: ["Chain Service"],
                "summary": "Onboard a new chain",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "chain_name": {
                                        "type": "string",
                                        "description": "The name of the chain",
                                        "example": "BTC"
                                    },
                                    "public_chain_identifier": {
                                        "type": "string",
                                        "description": "The public identifier of the chain",
                                        "example": "bitcoin"
                                    },
                                    "key_algo": {
                                        "type": "string",
                                        "description": "The key algorithm used",
                                        "example": "SECP256K1"
                                    },
                                    "seed_length": {
                                        "type": "integer",
                                        "description": "The length of the seed in bytes",
                                        "example": 64
                                    },
                                    "transaction_type": {
                                        "type": "string",
                                        "description": "The type of transaction",
                                        "example": "EVM"
                                    }
                                },
                                "required": ["chain_name", "public_chain_identifier", "key_algo", "transaction_type"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Chain onboarded successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "ChainId onboarded successfully"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request body",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "Invalid request body"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "Internal server error"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/chain/{chainId}": {
            "get": {
                tags: ["Chain Service"],
                "summary": "Get chain data by chainId",
                "parameters": [
                    {
                        "name": "chainId",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "The ID of the chain"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Chain data retrieved successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "chain_name": {
                                            "type": "string",
                                            "example": "BTC"
                                        },
                                        "public_chain_identifier": {
                                            "type": "string",
                                            "example": "bitcoin"
                                        },
                                        "key_algo": {
                                            "type": "string",
                                            "example": "SECP256K1"
                                        },
                                        "seed_length": {
                                            "type": "integer",
                                            "example": 64
                                        },
                                        "transaction_type": {
                                            "type": "string",
                                            "example": "EVM"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Chain data not found",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "Chain data not found"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "Internal server error"
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
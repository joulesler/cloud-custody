const { SUPPORTED_KMS } = require('../../lib/enums/keys');

module.exports.keySpec = {
  "paths": {
    "/key/generate": {
      "post": {
        tags: [ "Key Service" ],
        "summary": "Generate a master key pair for a chain",
        "description": "This endpoint generates a master key pair for a chain. Each key has a corresponding key stored on the AWS KMS and the encrypted seed is stored in the database.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "chainId": {
                    "type": "string",
                    "description": "The chain id for which the master key pair is to be generated",
                    "example": "bitcoin"
                  },
                  "isMasterKey": {
                    "type": "boolean",
                    "description": "Flag indicating if the key is a master key",
                    "example": true
                  },
                  "keyType": {
                    "type": "string",
                    "enum": Object.keys(require('../../lib/enums/keys').KEY_REFERENCE_TYPE),
                    "description": "The type of the key",
                    "example": "SEED"
                  },
                  "kmsType": {
                    "type": "string",
                    "enum": Object.keys(SUPPORTED_KMS),
                    "description": "The type of the KMS to be used (awsKms, localKms, cloudHsm, utimaco)",
                    "example": "awsKms"
                  }
                },
                "required": ["chainId", "keyType", "kmsType"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Master key pair generated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "keyPair": {
                      "type": "object",
                      "description": "The generated key pair",
                      "example": {
                        "xPubKey": "xpub661MyMwAqRbcGfXdb8cS9haeoNSPWvFPpobVe3Zp3kBtmLvP86TER6gHMCkN96SGfwbwJZurC5vXGBJFkoZwAfPRCAAumVKjDgorZZfWM4Y",
                        "chainCode": "d52b68bf88beadb38a2c410275ce9173c6892438862bed53e80fba5b96539379",
                        "KeyId": "aa7d3913-ae8d-48bb-9fee-022ad6ff37ae",
                        "Arn": "arn:aws:kms:ap-southeast-1:591687752526:key/aa7d3913-ae8d-48bb-9fee-022ad6ff37ae"
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
                    "success": {
                      "type": "boolean",
                      "example": false
                    },
                    "error": {
                      "type": "string",
                      "example": "chainId is required"
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
                    "success": {
                      "type": "boolean",
                      "example": false
                    },
                    "error": {
                      "type": "string",
                      "example": "Internal server error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/key/child": {
      "post": {
        tags: [ "Key Service" ],
        "summary": "Generate a child key from a master key",
        "description": "This endpoint generates a key from a master key using the provided derivation path and either a master key label or an extended public key (xPubKey).",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "derivationPath": {
                    "type": "string",
                    "description": "The derivation path for the child key",
                    "example": "m/44'/60'/0'/0/0"
                  },
                  "masterKeyLabel": {
                    "type": "string",
                    "description": "The label of the master key",
                    "example": "master-key-1"
                  },
                  "xPubKey": {
                    "type": "string",
                    "description": "The extended public key"
                  }
                },
                "required": ["derivationPath"],
                "oneOf": [
                  { "required": ["masterKeyLabel"] },
                  { "required": ["xPubKey"] }
                ]
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
                    "keyPair": {
                      "type": "object",
                      "description": "The generated key pair",
                      example: {
                        "publicKey": "0434d3ac2535ccde15bbf3aba4a01d597481f4e36a10485a6af31cc0892ee64a6002db2a41f26466629e880942ae818f2a7ae9aa9f488cde8cc2cc2dd20b75edee",
                        "address": "0x239ef41a40eb5eb8b9f0ab67205e1c5f85492ccb",
                        "accountXpub": "xpub6AYh1H4o5nWvoa68yNS1WkdSjtWKfsFDyNAGieASFngs9MxY8eDjMYUCLHumSbPg3SQdrtrZEbrH3p79iVDJjxMXWiVCEJ1qR9FxHmfkfKG"
                      }
                    },
                    "error": {
                      "type": "string",
                      "description": "Error message if the request failed",
                      example: "Child key already exists"
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
};

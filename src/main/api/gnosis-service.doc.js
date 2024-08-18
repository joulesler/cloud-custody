module.exports.gnosisSpec = {
  "paths": {
    "/gnosis/approveHash": {
      "post": {
        tags: [ "Gnosis Service" ],
        "summary": "Approve a hash for a Gnosis Safe transaction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "safeTxHash": {
                    "type": "string",
                    "description": "The hash of the transaction to approve",
                    "example": "0x..."
                  },
                  "masterKeyLabel": {
                    "type": "string",
                    "description": "The label of the master key",
                    "example": "3fe6b156-5756-404c-ab54-675516cebb3b"
                  },
                  "derivationPath": {
                    "type": "string",
                    "description": "The derivation path for the key",
                    "example": "m/44'/60'/0'/0/0"
                  }
                },
                "required": ["safeTxHash", "masterKeyLabel", "derivationPath"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Hash approved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "address": {
                      "type": "string",
                      "example": "0x...",
                      "description": "The address of the signer"
                    },
                    "signature": {
                      "type": "object",
                      "description": "The signature object returned by the safe",
                      "example": {
                        "signer": "0xed1e4bcd07120660cd2cae9d959fd924b1bb7449",
                        "data": "0xa979a8fa0dfbc05e8c47afe4631e6414f565f4a9ed99bbf7b60208ea01857498416a1a18aacfcb24d2712926c68cc015c95adf50393d47560c45babd8d1864db1c",
                        "isContractSignature": false
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
                      "example": "Validation error message"
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
    "/gnosis/getHashAbi": {
      "get": {
        tags: [ "Gnosis Service" ],
        "summary": "Get the ABI-encoded transaction hash",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "to": {
                    "type": "string",
                    "description": "The recipient address",
                    "example": "0x..."
                  },
                  "value": {
                    "type": "string",
                    "description": "The value to be transferred",
                    "example": "1000000000000000000"
                  },
                  "data": {
                    "type": "string",
                    "description": "The data payload",
                    "example": "0x..."
                  },
                  "operation": {
                    "type": "integer",
                    "description": "The operation type",
                    "example": 0
                  },
                  "safeTxGas": {
                    "type": "string",
                    "description": "The gas limit for the safe transaction",
                    "example": "21000"
                  },
                  "baseGas": {
                    "type": "string",
                    "description": "The base gas limit",
                    "example": "21000"
                  },
                  "gasPrice": {
                    "type": "string",
                    "description": "The gas price",
                    "example": "20000000000"
                  },
                  "gasToken": {
                    "type": "string",
                    "description": "The token used to pay for gas",
                    "example": "0x..."
                  },
                  "refundReceiver": {
                    "type": "string",
                    "description": "The address to receive any gas refund",
                    "example": "0x..."
                  },
                  "nonce": {
                    "type": "string",
                    "description": "The transaction nonce",
                    "example": "1"
                  }
                },
                "required": ["to", "value", "data", "operation", "safeTxGas", "baseGas", "gasPrice", "gasToken", "refundReceiver", "nonce"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "ABI-encoded transaction hash",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string",
                  "example": "0x..."
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
                      "example": "Validation error message"
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
    "/gnosis/addSignature": {
      "post": {
        tags: [ "Gnosis Service" ],
        "summary": "Add a signature to a Gnosis Safe transaction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "ethSafeTransaction": {
                    "type": "object",
                    "description": "The EthSafeTransaction object",
                    "example": {
                      "to": "0x...",
                      "value": "1000000000000000000",
                      "data": "0x...",
                      "operation": 0,
                      "safeTxGas": "21000",
                      "baseGas": "21000",
                      "gasPrice": "20000000000",
                      "gasToken": "0x...",
                      "refundReceiver": "0x...",
                      "nonce": 1
                    }
                  },
                  "ethSignSignature": {
                    "type": "object",
                    "description": "The EthSafeSignature object from SafeProtocol",
                    "example": {
                      "signer": "0x...",
                      "data": "0x..."
                    }
                  }
                },
                "required": ["ethSafeTransaction", "ethSignSignature"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signature added successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "safeTransaction": {
                      "type": "object",
                      "description": "The updated SafeTransaction object",
                      "example": {
                        "to": "0x...",
                        "value": "1000000000000000000",
                        "data": "0x...",
                        "operation": 0,
                        "safeTxGas": "21000",
                        "baseGas": "21000",
                        "gasPrice": "20000000000",
                        "gasToken": "0x...",
                        "refundReceiver": "0x...",
                        "nonce": 1,
                        "signatures": [
                          {
                            "signer": "0x...",
                            "data": "0x..."
                          }
                        ]
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
                      "example": "Validation error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/gnosis/execTransaction": {
      "post": {
        tags: [ "Gnosis Service" ],
        "summary": "Execute a Gnosis Safe transaction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "to": {
                    "type": "string",
                    "description": "The address to send the transaction to",
                    "example": "0x..."
                  },
                  "value": {
                    "type": "string",
                    "description": "The value of the transaction",
                    "example": "1000000000000000000"
                  },
                  "data": {
                    "type": "string",
                    "description": "The data to send with the transaction",
                    "example": "0x..."
                  },
                  "operation": {
                    "type": "integer",
                    "description": "The operation type (0 for Call, 1 for DelegateCall)",
                    "example": 0
                  },
                  "safeTxGas": {
                    "type": "string",
                    "description": "The gas limit for the transaction",
                    "example": "21000"
                  },
                  "baseGas": {
                    "type": "string",
                    "description": "The base gas for the transaction",
                    "example": "21000"
                  },
                  "gasPrice": {
                    "type": "string",
                    "description": "The gas price for the transaction",
                    "example": "20000000000"
                  },
                  "gasToken": {
                    "type": "string",
                    "description": "The token to use for gas payment",
                    "example": "0x..."
                  },
                  "refundReceiver": {
                    "type": "string",
                    "description": "The address to receive the gas refund",
                    "example": "0x..."
                  },
                  "signatures": {
                    "type": "string",
                    "description": "The signatures for the transaction",
                    "example": "0x..."
                  }
                },
                "required": ["to", "value", "operation", "gasPrice"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Transaction executed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "encodedData": {
                      "type": "string",
                      "example": "0x..."
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
                      "example": "Validation error message"
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
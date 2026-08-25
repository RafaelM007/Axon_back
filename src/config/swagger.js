const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Axon API",
            version: "1.0.0",
            description: "Documentação da API do Axon."
        },

        servers: [
            {
                url: "http://localhost:3000"
            }
        ],

        components: {
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },
                        name: {
                            type: "string",
                            example: "Rafael Moreira"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "rafael@email.com"
                        },
                        birthDate: {
                            type: "string",
                            format: "date",
                            example: "2006-05-15"
                        },
                        phone: {
                            type: "string",
                            example: "35999999999"
                        },
                        profileImage: {
                            type: "string",
                            example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
                        },
                        isVerified: {
                            type: "boolean",
                            example: false
                        }
                    }
                },
               Group: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },
                        name: {
                            type: "string",
                            example: "Grupo de Estudos"
                        },
                        description: {
                            type: "string",
                            example: "Grupo para organizar estudos e tarefas."
                        },
                        code: {
                            type: "string",
                            example: "ABC123"
                        },
                        maxMembers: {
                            type: "integer",
                            minimum: 2,
                            maximum: 100,
                            example: 10
                        },
                        creator: {
                            type: "string",
                            example: "64f987654321abcdef123456"
                        },
                        members: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    user: {
                                        type: "string",
                                        example: "64f987654321abcdef123456"
                                    },
                                    role: {
                                        type: "string",
                                        enum: ["admin", "member"],
                                        example: "member"
                                    },
                                    points: {
                                        type: "integer",
                                        minimum: 0,
                                        example: 10
                                    },
                                    pointsUpdatedAt: {
                                        type: "string",
                                        format: "date-time"
                                    }
                                }
                            }
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },
                Task: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },
                        title: {
                            type: "string",
                            example: "Estudar programação"
                        },
                        description: {
                            type: "string",
                            example: "Estudar Node.js durante 2 horas."
                        },
                        points: {
                            type: "integer",
                            minimum: 1,
                            example: 10
                        },
                        group: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },
                        createdBy: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },
                        startsAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-24T15:00:00.000Z"
                        },
                        deadline: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-24T18:00:00.000Z"
                        },
                        isRecurring: {
                            type: "boolean",
                            example: false
                        },
                        parentTask: {
                            type: "string",
                            nullable: true,
                            example: null
                        },
                        recurrence: {
                            type: "object",
                            properties: {
                                frequency: {
                                    type: "string",
                                    enum: ["none", "daily", "weekly", "monthly"],
                                    example: "none"
                                },
                                occurrences: {
                                    type: "integer",
                                    example: 1
                                }
                            }
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },
                TaskSubmission: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },

                        task: {
                            type: "string",
                            example: "64f123456789abcdef123456"
                        },

                        user: {
                            type: "string",
                            example: "64f987654321abcdef123456"
                        },

                        evidence: {
                            type: "object",
                            properties: {
                                url: {
                                    type: "string",
                                    example: "https://res.cloudinary.com/example/image/upload/evidence.jpg"
                                },
                                publicId: {
                                    type: "string",
                                    example: "axon/task-evidence/example123"
                                }
                            }
                        },

                        status: {
                            type: "string",
                            enum: ["accepted", "voting", "invalidated"],
                            example: "accepted"
                        },

                        contest: {
                            type: "object",
                            properties: {
                                reason: {
                                    type: "string",
                                    example: "A evidência não comprova a realização da tarefa."
                                },
                                createdBy: {
                                    type: "string",
                                    nullable: true,
                                    example: "64f987654321abcdef123456"
                                },
                                createdAt: {
                                    type: "string",
                                    format: "date-time",
                                    nullable: true
                                },
                                resolved: {
                                    type: "boolean",
                                    example: false
                                }
                            }
                        },

                        votes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    user: {
                                        type: "string",
                                        example: "64f987654321abcdef123456"
                                    },
                                    decision: {
                                        type: "string",
                                        enum: ["accepted", "invalidated"],
                                        example: "accepted"
                                    },
                                    votedAt: {
                                        type: "string",
                                        format: "date-time"
                                    }
                                }
                            }
                        },

                        initialValidations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    user: {
                                        type: "string",
                                        example: "64f987654321abcdef123456"
                                    },
                                    action: {
                                        type: "string",
                                        enum: ["approved", "contested"],
                                        example: "approved"
                                    },
                                    createdAt: {
                                        type: "string",
                                        format: "date-time"
                                    }
                                }
                            }
                        },

                        rewardProcessed: {
                            type: "boolean",
                            example: true
                        },

                        finishedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true
                        },

                        finalDecision: {
                            type: "string",
                            enum: ["accepted", "invalidated"],
                            nullable: true,
                            example: null
                        },

                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },

                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                }
            },

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: ["./src/routes/*.js"],

    failOnErrors: true
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
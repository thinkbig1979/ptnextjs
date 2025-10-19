// Mock for @payloadcms/db-postgres

module.exports = {
  postgresAdapter: () => ({
    name: 'postgres',
    init: jest.fn(),
    connect: jest.fn(),
    destroy: jest.fn(),
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  }),
};

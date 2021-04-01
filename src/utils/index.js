const faker = require('faker');

const generateHit = (id) => ({
  client_id: id,
  device_id: faker.datatype.uuid(),
  user_id: faker.datatype.uuid(),
  value_1: faker.datatype.number(),
  value_2: faker.datatype.number(),
  value_3: faker.datatype.number(),
  value_4: faker.datatype.number(),
  time: faker.date.recent(),
});

module.exports = {
  generateHit,
};

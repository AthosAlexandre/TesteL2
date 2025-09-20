import { DataSource } from 'typeorm';
import 'dotenv/config';
import { Box } from '../boxes/box.entity';
import { DEFAULT_BOXES } from '../boxes/boxes.constant';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Box],
  synchronize: true,
  logging: false,
});

(async () => {
  await ds.initialize();
  const repo = ds.getRepository(Box);
  for (const b of DEFAULT_BOXES) {
    const exists = await repo.findOne({ where: { name: b.name } });
    if (!exists) await repo.save(repo.create(b));
  }
  console.log('Boxes seed ok');
  await ds.destroy();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { container } from 'tsyringe';
import { DgraphClient, DgraphClientStub } from 'dgraph-js';
import grpc from 'grpc';
import config from './config';

const dgraphClient = new DgraphClient(
  new DgraphClientStub(
    `${config.db.host}:${config.db.port}`,
    grpc.credentials.createInsecure()
  )
);

export { DgraphClient as Database };

container.register<DgraphClient>(DgraphClient, { useValue: dgraphClient });

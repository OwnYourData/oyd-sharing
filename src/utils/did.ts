import { DIDDocument, Resolver } from 'did-resolver';
import { getResolver } from 'web-did-resolver';

interface ServiceEndpoint {
  "@type": string;
  instance: string[];
}

const webResolver = getResolver();

const didResolver = new Resolver({
  ...webResolver,
});

export const resolve = async (did: string) => didResolver.resolve(did);

export const getServiceEndpoint = (document: DIDDocument, id: string): string | undefined => {
  const item = document.service?.find(x => x.id === id);

  return (item?.serviceEndpoint as unknown as ServiceEndpoint).instance[0];
}
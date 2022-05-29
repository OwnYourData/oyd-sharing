import { DIDDocument, Resolver } from 'did-resolver';
import { getResolver as getWebResolver } from 'web-did-resolver';
// @ts-expect-error no types available
import { getResolver as getOydidResolver } from 'oydid-did-resolver';

interface ServiceEndpoint {
  "@type": string;
  instance: string[];
}

const didResolver = new Resolver({
  ...getWebResolver(),
  ...getOydidResolver(),
});

export const resolve = async (did: string) => didResolver.resolve(did);

export const getServiceEndpoint = (document: DIDDocument, id: string): string | undefined => {
  // TODO: bugfix
  if ((document as any).didDocument)
    document = (document as any).didDocument as DIDDocument;
  
  const item = document.service?.find(x => x.id === id);

  return (item?.serviceEndpoint as unknown as ServiceEndpoint).instance[0];
}
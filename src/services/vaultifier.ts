import { Vaultifier, VaultifierWeb } from 'vaultifier';

let vaultifier: Vaultifier;

export const initialize = async () => {
  vaultifier = await VaultifierWeb.create();
  await vaultifier.initialize();
  await vaultifier.setEnd2EndEncryption(true);
};
export const getInstance = () => vaultifier;

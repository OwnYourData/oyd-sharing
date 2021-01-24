import { Vaultifier, VaultifierWeb } from 'vaultifier';

let vaultifier: Vaultifier;

export const initialize = async () => {
  const vault = await VaultifierWeb.create({
    clientId: 'dev.unterholzer.ownyourdata.sharing',
  });

  if (!vault)
    return;

  await vault.setEnd2EndEncryption(true);

  return vaultifier = vault;
};
export const getInstance = () => vaultifier;

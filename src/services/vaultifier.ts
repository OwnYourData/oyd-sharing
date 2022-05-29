import { Vaultifier, VaultifierWeb } from 'vaultifier';

let vaultifier: Vaultifier;

export const initialize = async () => {
  const vault = await VaultifierWeb.create({
    clientId: 'dev.unterholzer.ownyourdata.sharing',
  });
  await vault.initialize()

  if (!vault.vaultifier)
    return;

  vaultifier = vault.vaultifier;
  await vaultifier.setEnd2EndEncryption(true);

  return vaultifier;
};
export const getInstance = () => vaultifier;

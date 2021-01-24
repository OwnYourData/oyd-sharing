import * as oca from 'oca.js-vue';

const iterateForm = (form: any, callback: (control: any) => void) => {
  for (const section of form.sections) {
    for (const control of section.row.controls) {
      callback(control);
    }
  }
}

export const fillForm = (form: any, content: { [key: string]: any }): boolean => {
  const formDri = form.DRI;
  let hasFilled = false;

  iterateForm(form, (control) => {
    if (control.referenceSchema) {
      hasFilled = hasFilled || fillForm(control.referenceSchema.form, content);
    }
    else {
      const dataObj = content[formDri];

      if (!dataObj || !dataObj[control.attrName])
        // TODO: Error handling
        return;

      control.value = dataObj[control.attrName];
      hasFilled = true;
    }
  });

  return hasFilled;
}

export const getObjectFromForm = (form: any) => {
  const obj: any = {}

  iterateForm(form, (control) => {
    obj[control.attrName] = control.value;
  });

  return obj;
}

export const getSchemaDris = (form: any, schemaDris: Set<string> = new Set<string>()): string[] => {
  schemaDris.add(form.DRI);

  iterateForm(form, (control) => {
    if (control.referenceSchema) {
      getSchemaDris(control.referenceSchema.form, schemaDris);
    }
  });

  return Array.from(schemaDris.values());
}

export const getLanguages = (overlays: any[]) => {
  return overlays.reduce((prev: string[], curr: any) => {
    if (curr.language && prev.indexOf(curr.language) === -1)
      return [...prev, curr.language];

    return prev;
  }, []);
}

export const renderForm = async (overlays: any[], schemaDri: string, language?: string): Promise<any> => {
  if (language)
    overlays = overlays.filter((x: any) => !x.language || x.language === language);

  const form = (await oca.renderForm(overlays, schemaDri)).form;

  // TODO: 
  await new Promise(resolve => setTimeout(resolve, 1000));

  return form;
}

export const getTitle = (overlays: any[]): string | undefined => {
  return overlays.find(x => x.name)?.name;
}
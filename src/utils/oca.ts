import * as oca from 'oca.js-vue';

const iterateForm = (form: any, callback: (control: any) => void) => {
  for (const section of form.sections) {
    for (const control of section.row.controls) {
      callback(control);
    }
  }
}

const fillForm = (form: any, content: any) => {
  iterateForm(form, (control) => {
    if (!content[control.attrName])
      // TODO: Error handling
      return;

    control.value = content[control.attrName];
  });
}

export const getObjectFromForm = (form: any) => {
  const obj: any = {}

  iterateForm(form, (control) => {
    obj[control.attrName] = control.value;
  });

  return obj;
}

export const getLanguages = (overlays: any[]) => {
  return overlays.reduce((prev: string[], curr: any) => {
    if (curr.language && prev.indexOf(curr.language) === -1)
      return [...prev, curr.language];

    return prev;
  }, []);
}

export const renderForm = (overlays: any[], item?: any, language?: string): any => {
  if (language)
    overlays = overlays.filter((x: any) => !x.language || x.language === language);

  const form = oca.renderForm(overlays).form;

  if (item)
    fillForm(form, item);

  return form;
}

export const getTitle = (overlays: any[]): string | undefined => {
  return overlays.find(x => x.name)?.name;
}
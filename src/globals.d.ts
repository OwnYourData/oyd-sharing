declare module 'oca.js-vue' {
  declare const FormBuilderGui: VueConstructor;
  declare function renderForm(overlays: any[], schemaDri: string): {
    form: any;
  };
}
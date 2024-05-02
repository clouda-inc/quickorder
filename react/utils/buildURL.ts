export const buildURL = (
  account: string,
  acronym: string,
  idWithouthAcronym: string,
  fieldName: string,
  file: string
) => {
  return account && acronym && idWithouthAcronym && fieldName && file
    ? `https://${account}.vtexcommercestable.com.br/api/dataentities/${acronym}/documents/${idWithouthAcronym}/${fieldName}/attachments/${file}`
    : "";
};

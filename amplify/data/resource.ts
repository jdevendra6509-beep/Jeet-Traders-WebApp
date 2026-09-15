import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Customer: a
    .model({
      name: a.string().required(),
      address: a.string().required(),
      state: a.string().required(),
      stateCode: a.string().required(),
      gstin: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  MasterItem: a
    .model({
      description: a.string().required(),
      hsnCode: a.string().required(),
      unit: a.string().required(),
      gstRate: a.float().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Invoice: a
    .model({
      invoiceNo: a.string().required(),
      dateOfSupply: a.string().required(),
      poNo: a.string(),
      poDate: a.string(),
      vehicleNo: a.string(),
      nameOfTransport: a.string(),
      placeOfSupply: a.string(),
      modeOfTransport: a.string(),
      customerId: a.string(),
      receiverName: a.string().required(),
      receiverAddress: a.string().required(),
      receiverState: a.string().required(),
      receiverStateCode: a.string().required(),
      receiverGstin: a.string().required(),
      loadingCharges: a.float().default(0),
      transportCharges: a.float().default(0),
      otherCharges: a.float().default(0),
      hamali: a.float().default(0),
      items: a.json().required(),
    })
    .identifier(['invoiceNo'])
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});

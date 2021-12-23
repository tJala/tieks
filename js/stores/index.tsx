
import React from 'react';
import UserStore from './UserStore';

export const stores = {
  user: new UserStore(),
};
type ContextStores = typeof stores;

const storeContext = React.createContext<ContextStores>(stores);

export const useStores = (): ContextStores => React.useContext(storeContext);

export const hydrateStores = async () => {
  for (const key in stores) {
    if (Object.prototype.hasOwnProperty.call(stores, key)) {
      const s = stores[key];

      if (s.hydrate) {
        await s.hydrate();
      }
    }
  }
};
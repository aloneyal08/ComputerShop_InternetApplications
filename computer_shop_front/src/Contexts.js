import {createContext} from 'react';

export const UserContext = createContext({
  user: null,
  setUser: () => {},
});

export const MoneyContext = createContext({
  currency: 'USD',
  setCurrency: () => {},
  exchangeRates: {},
});

export const TagsContext = createContext([]);

